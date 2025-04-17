# <%= LanguageName %> Visual Studio Code Extension

## What is in this folder?

This folder contains two subdirectories:

* *vscode:* This directory contains code necessary to build a Visual Studio Code extension for your new DSL. The VS Code extension is really generic.
* *backend:* This is where the magic happens. You will find the grammar of your language in `backend/<%= language-id %>.anytext`

## Getting Started

To get started with your VS Code Extension, we suggest the following steps:

1. **Create the grammar definition.** To support this task, download the Anytext extension from the marketplace, if you haven't already done so.
2. **Adjust the grammar.** The template already contains a manual extension of the generated code. Use this file to override the default behavior of the LSP server and adjust it to your needs. To generate the code, the generated `package.json` contains two NPM scripts:
   * `npm run generate-parser` regenerates the parser. Use this script whenever you make changes to your grammar for these changes to become effective.
   * `npm run generate-metamodel` regenerates the metamodel. Use this script whenever you make changes to the abstract syntax of your DSL.
3. **Adjust the editor services.** AnyText is built in such a way that you can easily extend the functionality of the generated language code and extend or customize it. As an example, the template includes a custom code lens and a specification that the abstract syntax element `Person` should be rendered with the symbol kind object. Note that the LSP is strict on the possible symbol kinds, so you have to chose from what LSP provides.
4. **Debug the extension.** You can start your VS Code extension right from VS Code. The template is configured to give you a *Run Extension* launch configuration. Running the extension in debug will pop up a window asking you which Visual Studio (or other IDE) window you want to use to debug the LSP server.
5. **Repeat.** Your grammar will probably not fit all your needs on the first attempt. Repeat the previous steps until you are happy with the result.

## Install your extension

* To start using your extension with VS Code, copy it into the `<user home>/.vscode/extensions` folder and restart Code.
* To share your extension with the world, read the [VS Code documentation](https://code.visualstudio.com/api/working-with-extensions/publishing-extension) about publishing an extension. The extension is already prepared to be packaged using `vsce pack`.

## Troubleshooting

The code generator should already have installed the AnyText code generator as a global .NET tool. If this did not work for some reason, you can install it manually:

`dotnet tool install nmf-anytextgen --global`

Afterwards, the code generator can be executed anywhere using `anytextgen`. You can see the documentation how to generate the code using `anytextgen help`.
