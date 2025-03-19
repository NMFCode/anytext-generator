# <%= LanguageName %> Visual Studio Code Extension

## What is in this folder?

This folder contains two subdirectories:

* *vscode:* This directory contains code necessary to build a Visual Studio Code extension for your new DSL. The VS Code extension is really generic.
* *backend:* This is where the magic happens. You will find the grammar of your language in `backend/<%= language-id %>.anytext`

## Getting Started

To get started with your VS Code Extension, we suggest the following steps:

1. **Create the grammar definition.** To support this task, download the Anytext extension from the marketplace, if you haven't already done so.
2. **Generate the code.** To generate the code, download the code generator as a .NET tool
   `dotnet tool install nmf-anytextgen --global`
   Afterwards, the code generator can be executed anywhere using `anytextgen`. You can see the documentation how to generate the code using `anytextgen help`.
3. **Adjust the grammar.** The template already contains a manual extension of the generated code. Use this file to override the default behavior of the LSP server and adjust it to your needs.
4. **Debug the extension.** You can start your VS Code extension right from VS Code when opening the *vscode* folder. The template is configured to give you a *Run Extension* launch configuration. Running the extension in debug will pop up a window asking you which Visual Studio window you want to use to debug the LSP server.
5. **Repeat.** Your grammar will probably not fit all your needs on the first attempt. Repeat the previous steps until you are happy with the result.

## Install your extension

* To start using your extension with VS Code, copy it into the `<user home>/.vscode/extensions` folder and restart Code.
* To share your extension with the world, read the [VS Code documentation](https://code.visualstudio.com/api/working-with-extensions/publishing-extension) about publishing an extension.
