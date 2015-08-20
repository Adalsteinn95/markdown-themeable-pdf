Themeable markdown to PDF converter
===================================

##### This [Atom package](https://atom.io/packages/markdown-themeable-pdf) converts / prints / exports your markdown files simple and pretty to PDFs.

The package was created at the beginning to help in the daily work with manuals for customers. Many people are not familiar with Markdown and they will now receive a well-formatted PDF from their developers. **Important here is that the PDF looks good and professional**. This [Atom package](https://atom.io/packages/markdown-themeable-pdf) tries to ask about this task.

> If you find this module **useful**, you find **errors**, or you have **suggestions** - please send me your [FEEDBACK](https://github.com/cakebake/markdown-themeable-pdf/issues/new) - feel free to **CONTRIBUTE**. Keep in mind that this plugin is under active development. :)

### Installation

Search in atom under **Settings View -> Install -> Packages** the package `markdown-themeable-pdf` and start the installation.

### Upadate

Atom notifies you when a new version is available. Sometimes you must reload your atom window after updating to apply to new changes. Press `ctrl-shift-P` and hit `Window: Reload`.

### Usage

The PDF can be generated in various ways:

-	Right-click in the editor area when a file is opened (and saved) and select `Markdown to PDF` **or**
-	Press `ctrl-shift-E` (E = Export) in the editor area when a file is opened (and saved)
-	Open Markdown Preview with `ctrl-shift-M`, right-click in markdown-preview area and select `Save As PDF`

#### Page breaks

You can start any time a new page with shortcode `<div class="page-break" />` in your markdown.

### Example / Demo PDF

See [Demo.md.pdf](https://github.com/cakebake/markdown-themeable-pdf/raw/master/tests/Demo.md.pdf) - the PDF version of [Demo.md](https://github.com/cakebake/markdown-themeable-pdf/raw/master/tests/Demo.md).

### Todo

-	Create the package configuration (*custom rendering settings, custom themes, custom stylesheets, ...*\)
-	Custom header and footer
-	Fix context menu item in tree view
-	Local images
-	More rendering options like Emojis, Todos, ...

### Known Issues

#### Table header glitches when a table starts directly on a new page

When that happens, you can put in your markdown in front of the table an html code `<div class="page-break" />` to prevent this.

### Credits

Special thanks to

-	[Atom](https://atom.io/) for this wonderful editor!
-	[chjj/marked](https://github.com/chjj/marked) - A markdown parser and compiler. Built for speed.
-	[marcbachmann/node-html-pdf](https://github.com/marcbachmann/node-html-pdf) - Html to pdf converter in nodejs.
-	[isagalaev/highlight.js](https://github.com/isagalaev/highlight.js) - Javascript syntax highlighter.
