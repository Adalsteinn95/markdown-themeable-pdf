var CompositeDisposable = require('atom').CompositeDisposable;
var fs = require('fs');
var path = require('path');

module.exports = {
    config: {
        exportFileType: {
            type: 'string',
            default: 'pdf',
            enum: ['html', 'pdf', 'jpeg', 'png']
        },
        codeHighlightingTheme: {
            type: 'string',
            default: 'github-gist.css',
            enum: (function () {
                var files = fs.readdirSync(__dirname + '/../node_modules/highlight.js/styles/');
                for (var i = 0; i < files.length; i++) {
                    if (path.extname(files[i]) != '.css') {
                        files.splice(i, 1);
                    }
                }
                return files;
            })(),
            description: 'Theme preview: https://highlightjs.org/static/demo/'
        },
        // @todo add hljs class to pre > code blocks with no language definition
        // codeHighlightingAuto: {
        //     title: 'Try to highlight code blocks with no language definition',
        //     type: 'boolean',
        //     default: true
        // },
        format: {
            title: 'Papersize Format',
            type: 'string',
            default: 'A4',
            enum: ['A3', 'A4', 'A5', 'Legal', 'Letter', 'Tabloid'],
            description: 'Available only for export as pdf, jpg, png.'
        },
        orientation: {
            title: 'Papersize Orientation',
            type: 'string',
            default: 'portrait',
            enum: ['portrait', 'landscape'],
            description: 'Available only for export as pdf, jpg, png.'
        },
        pageBorder: {
            title: 'Page border size',
            type: 'string',
            default: '1cm',
            description: 'Allowed units: mm, cm, in, px. Available only for export as pdf, jpg, png.'
        },
        imageQuality: {
            title: 'Image quality',
            type: 'integer',
            default: 90,
            description: 'Available only for export as jpg, png.'
        },
        enableSmartArrows: {
            type: 'boolean',
            default: true,
            description: 'Beautification for arrows like \'-->\' or \'==>\'.'
        },
        enableCheckboxes: {
            title: 'Enable task lists',
            type: 'boolean',
            default: true,
            description: 'Replacement for \'[ ]\' and \'[x]\' in markdown source.'
        },
        enableHtmlInMarkdown: {
            title: 'Enable HTML tags in markdown source',
            type: 'boolean',
            default: true,
            description: 'Required for \'<div class="page-break" />\'!'
        },
        enableLinkify: {
            title: 'Autoconvert URL-like text to links',
            type: 'boolean',
            default: false
        },
        enableTypographer: {
            title: 'Enable Typographer',
            type: 'boolean',
            default: true,
            description: 'Some language-neutral replacement + quotes beautification.'
        },
        enableXHTML: {
            title: 'Use \'/\' to close single tags',
            type: 'boolean',
            default: false,
            description: 'Eg. \'<br />\' or \'<img />\'.'
        },
        enableBreaks: {
            title: 'Convert new lines',
            type: 'boolean',
            default: false,
            description: 'Convert new lines (\'\\n\') in paragraphs into \'<br>\'.'
        },
        smartQuotes: {
            title: 'Quotes beautification replacement',
            type: 'string',
            default: '""\'\'',
            description: 'Double + single quotes replacement pairs, when typographer enabled.'
        }
    },
    subscriptions: null,
    activate: function () {
        this.subscriptions = new CompositeDisposable();
        var fileExtensions = [
            'markdown',
            'md',
            'mdown',
            'mkd',
            'mkdown',
            'ron',
            'txt'
        ];
        for (var i = 0; i < fileExtensions.length; i++) {
            this.subscriptions.add(
                atom.commands.add(
                    'atom-pane[data-active-item-name$=\\.' + fileExtensions[i] + ']',
                    'markdown-themeable-pdf:export',
                    this.exportEditor.bind(this)
                )
            );
            this.subscriptions.add(
                atom.commands.add(
                    '.tree-view .file .name[data-name$=\\.' + fileExtensions[i] + ']',
                    'markdown-themeable-pdf:export',
                    this.exportFile.bind(this)
                )
            );
        }
        this.subscriptions.add(
            atom.commands.add(
                '.markdown-preview',
                'markdown-themeable-pdf:export',
                this.exportPreview.bind(this)
            )
        );
    },
    deactivate: function () {
        return this.subscriptions.dispose();
    },
    convertFile: function (filePath, encoding) {

        atom.notifications.addInfo('Start converting markdown ' + filePath);

        var exportType = atom.config.get('markdown-themeable-pdf.exportFileType');
        var url = require('url');
        var hljs = require('highlight.js');

        var md = require('markdown-it')({
            html: atom.config.get('markdown-themeable-pdf.enableHtmlInMarkdown'),
            linkify: atom.config.get('markdown-themeable-pdf.enableLinkify'),
            typographer: atom.config.get('markdown-themeable-pdf.enableLinkify'),
            xhtmlOut: atom.config.get('markdown-themeable-pdf.enableXHTML'),
            breaks: atom.config.get('markdown-themeable-pdf.enableBreaks'),
            quotes: atom.config.get('markdown-themeable-pdf.smartQuotes'),
            langPrefix: 'hljs ' + atom.config.get('markdown-themeable-pdf.codeHighlightingTheme').replace(/\./g, '-') + ' ',
            highlight: function (str, lang) {
                if (lang && hljs.getLanguage(lang)) {
                    try {
                        return hljs.highlight(lang, str).value;
                    } catch (err) {
                        throw err;
                    }
                }
                // if (atom.config.get('markdown-themeable-pdf.codeHighlightingAuto')) {
                //     try {
                //         return hljs.highlightAuto(str).value;
                //     } catch (err) {
                //         throw err;
                //     }
                // }
                return ''; // use external default escaping
            }
        });

        // checkboxes
        if (atom.config.get('markdown-themeable-pdf.enableCheckboxes')) {
            md.use(require('markdown-it-checkbox'), {
                divWrap: true,
                divClass: 'checkbox',
                idPrefix: 'checkbox-'
            });
        }

        // smart arrows
        if (atom.config.get('markdown-themeable-pdf.enableSmartArrows')) {
            md.use(require('markdown-it-smartarrows'));
        }

        // fix src scheme
        if (exportType != 'html') {
            md.renderer.rules.image = function (tokens, idx, options, env, self) {
                var token = tokens[idx];
                var src = token.attrs[token.attrIndex('src')][1];

                if (url.parse(src).protocol) {
                    return self.renderToken.apply(self, arguments);
                }
                if (path.resolve(src) !== src) {
                    src = path.resolve(path.dirname(filePath), src);
                }
                token.attrs[token.attrIndex('src')][1] = ('file:///' + src).replace(/\\/g, '/');

                return self.renderToken.apply(self, arguments);
            };
        }

        // innerWrap cells to avoid page break glitches
        if (exportType != 'html') {
            md.renderer.rules.th_open = function () {
                return '<th><div>';
            };
            md.renderer.rules.th_close = function () {
                return '</div></th>';
            };
            md.renderer.rules.td_open = function () {
                return '<td><div>';
            };
            md.renderer.rules.td_close = function () {
                return '</div></td>';
            };
        }

        if (exportType != 'html') {
            var htmlToPdf = require('html-pdf');
        }

        if (typeof encoding === 'undefined') {
            encoding = atom.config.get('core.fileEncoding');
        }

        fs.readFile(filePath, encoding, function (err, markdown) {

            if (err) {
                atom.notifications.addError('Could not read markdown file: ' + err.message);
                throw err;
            }

            try {
                var html = md.render(markdown);
            } catch (err) {
                throw err;
            }

            var destFile = filePath + '.' + exportType;
            var documentStyle = fs.readFileSync(__dirname + "/../css/document.css", encoding);
            var codeStyle = fs.readFileSync(__dirname + '/../node_modules/highlight.js/styles/' + atom.config.get('markdown-themeable-pdf.codeHighlightingTheme'), encoding);
            var dom = '<!DOCTYPE html>\n' +
                '<html>\n' +
                '<head>\n<meta charset="UTF-8">\n<title>\n' + destFile + '\n</title>\n<style>\n' + codeStyle + '\n' + documentStyle + '\n</style>\n</head>\n' +
                '<body>\n' + html + '\n</body>\n' +
                '</html>\n';

            if (exportType == 'html') {
                fs.writeFile(destFile, dom, function (err) {
                    if (err) {
                        atom.notifications.addError('Could not write to HTML file: ' + err.message);
                        throw err;
                    }

                    atom.notifications.addSuccess('HTML was created in ' + destFile);
                });
            } else {
                htmlToPdf.create(dom, {
                    format: atom.config.get('markdown-themeable-pdf.format'),
                    orientation: atom.config.get('markdown-themeable-pdf.orientation'),
                    border: atom.config.get('markdown-themeable-pdf.pageBorder'),
                    type: exportType,
                    quality: atom.config.get('markdown-themeable-pdf.imageQuality')
                }).toStream(function (err, stream) {

                    if (err) {
                        atom.notifications.addError('Could not print the document: ' + err.message);
                        throw err;
                    }

                    var dest = fs.createWriteStream(destFile);

                    dest.on('error', function (err) {
                        if (err) {
                            atom.notifications.addError('Could not write to file: ' + err.message);
                            throw err;
                        }
                    });

                    dest.on('finish', function () {
                        atom.notifications.addSuccess('File was created in ' + destFile);
                    });

                    stream.pipe(dest);
                });
            }

        });
    },
    exportEditor: function (arg) {
        var editor;
        if ((editor = atom.workspace.getActiveTextEditor())) {
            if (editor.isEmpty()) {
                atom.notifications.addError('Current editor is empty');
                return console.error('Current editor is empty. Abort export action!');
            }
            if (editor.isModified()) {
                atom.notifications.addWarning('Any unsaved changes are ignored. Please save your changes before exporting!');
            }

            return this.convertFile(editor.getPath(), editor.getEncoding());
        }
    },
    exportFile: function (arg) {
        var filePath, target = arg.target;
        if ((filePath = target.dataset.path)) {
            return this.convertFile(filePath);
        }
    },
    exportPreview: function (arg) {
        var pane = atom.workspace.getActivePaneItem();

        if (typeof pane.filePath !== 'undefined') {
            return this.convertFile(pane.filePath);
        }
    }
};
