// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const fs = require("fs");
const path = require("path");
const { execSync } = require('child_process');
// const color = require('color');
const {newProblem} = require('./src/commands/new');
const {testProblem} = require('./src/commands/test');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	console.log('Congratulations, your extension "oitest" is now active!');
	let new_problem = vscode.commands.registerCommand('oitest.newProblem', newProblem);
	let test_problem = vscode.commands.registerCommand('oitest.testProblem', testProblem);

	context.subscriptions.push(new_problem);
	context.subscriptions.push(test_problem);
}

// This method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}
