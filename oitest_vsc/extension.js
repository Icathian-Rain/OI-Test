// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const fs = require("fs");
const path = require("path");
const { execSync } = require('child_process');
// const color = require('color');


function newAndOpen(filePath, content) {
	// 创建文件
	if (!fs.existsSync(filePath)) {
		fs.writeFileSync(filePath, content);
	}
	// 打开文件
	vscode.workspace.openTextDocument(filePath).then(doc => {
		vscode.window.showTextDocument(doc, { preview: false });
	});
}

function compile(problemFilePath, problemExePath, language) {

	let compileCommand = "";
	if (language === "cpp") {
		compileCommand = "g++ " + problemFilePath + " -o " + problemExePath;
	} else {
		return "Language not supported!";
	}
	try {
		execSync(compileCommand);
	} catch (error) {
		let error_info = error.stdout.toString();
		return error_info;
	}
	return true;
}

function exec(problemExePath, inputFilePath, outputFilePath) {
	let execCommand = problemExePath + " < " + inputFilePath + " > " + outputFilePath;
	try {
		execSync(execCommand);
	} catch (error) {
		let error_info = error.stdout.toString();
		return error_info;
	}
	return true;
}


function diff(ans_file, out_file) {
	let ans = fs.readFileSync(ans_file, "utf-8");
	let out = fs.readFileSync(out_file, "utf-8");
	// 去除结尾回车
	if (ans[ans.length - 1] === '\n') {
		ans = ans.slice(0, ans.length - 1);
	}
	if (out[out.length - 1] === '\n') {
		out = out.slice(0, out.length - 1);
	}
	fs.writeFileSync(ans_file, ans);
	fs.writeFileSync(out_file, out);
	// 对比
	if (ans === out) {
		return true;
	}
	else {
		return false;
	}
}



function newProblem() {
	// 输入题目ID
	vscode.window.showInputBox({
		placeHolder: "Please input a problem ID.",
		prompt: "Problem ID"
	}).then(value => {
		let problemID = value;
		if (problemID === undefined) {
			vscode.window.showErrorMessage("Please input a problem ID!");
			return;
		}
		// 获取当前打开的文件夹
		let folderPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
		if (folderPath === undefined) {
			vscode.window.showErrorMessage("Please open a folder!");
			return;
		}
		// 读取模板文件
		let workFolder = vscode.workspace.getConfiguration("oitest").get("workFolder");
		let language = vscode.workspace.getConfiguration("oitest").get("language");
		let patternPath = "";
		if (language === "cpp") {
			patternPath = path.join(folderPath, "pattern.cpp");
		}
		let patternFile = "";
		if (fs.existsSync(patternPath)) {
			patternFile = fs.readFileSync(patternPath, "utf-8");
		} else {
			vscode.window.showWarningMessage("Pattern file not found!");
		}
		// 创建工作文件夹
		let workFolderPath = path.join(folderPath, workFolder);
		if (!fs.existsSync(workFolderPath)) {
			fs.mkdirSync(workFolderPath);
		}
		// 创建题目文件夹
		let problemFolderPath = path.join(workFolderPath, problemID);
		if (!fs.existsSync(problemFolderPath)) {
			fs.mkdirSync(problemFolderPath);
		}
		// 创建题目文件 打开
		if (language === "cpp") {
			newAndOpen(path.join(problemFolderPath, problemID + ".cpp"), patternFile);
		}
		else {
			vscode.window.showErrorMessage("Language not supported!");
		}

		// 创建输入文件 打开
		newAndOpen(path.join(problemFolderPath, problemID + ".in"), "");
		// 创建答案文件 打开
		newAndOpen(path.join(problemFolderPath, problemID + ".ans"), "");
	});
}

function testProblem() {
	// 输入题目ID
	vscode.window.showInputBox({
		placeHolder: "Please input a problem ID.",
		prompt: "Problem ID"
	}).then(value => {
		let problemID = value;
		let workFolder = vscode.workspace.getConfiguration("oitest").get("workFolder");
		let language = vscode.workspace.getConfiguration("oitest").get("language");

		if (problemID === undefined) {
			vscode.window.showErrorMessage("Please input a problem ID!");
			return;
		}
		// 获取当前打开的文件夹
		let folderPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
		if (folderPath === undefined) {
			vscode.window.showErrorMessage("Please open a folder!");
			return;
		}
		// 进入工作文件夹
		let workFolderPath = path.join(folderPath, workFolder);
		if (!fs.existsSync(workFolderPath)) {
			vscode.window.showErrorMessage("Work folder not found!");
			return;
		}
		// 进入题目文件夹
		let problemFolderPath = path.join(workFolderPath, problemID);
		if (!fs.existsSync(problemFolderPath)) {
			vscode.window.showErrorMessage("Problem folder not found!");
			return;
		}
		let problemFilePath = ""
		if (language === "cpp") {
			problemFilePath = path.join(problemFolderPath, problemID + ".cpp");
		}
		else {
			vscode.window.showErrorMessage("Language not supported!");
			return;
		}
		let problemExePath = path.join(problemFolderPath, problemID + ".exe");
		let inputFilePath = path.join(problemFolderPath, problemID + ".in");
		let outputFilePath = path.join(problemFolderPath, problemID + ".out");
		let answerFilePath = path.join(problemFolderPath, problemID + ".ans");
		if (!fs.existsSync(problemFilePath)) {
			vscode.window.showErrorMessage("Problem file not found!");
			return;
		}
		// 编译题目文件
		let ret = compile(problemFilePath, problemExePath, language);
		if (ret !== true) {
			vscode.window.showErrorMessage(ret);
			return;
		}
		// 测试输入文件
		ret = exec(problemExePath, inputFilePath, outputFilePath);
		if (ret !== true) {
			vscode.window.showErrorMessage(ret);
			return;
		}
		// 对比答案文件
		ret = diff(answerFilePath, outputFilePath);
		if (ret !== true) {
			vscode.window.showErrorMessage("Wrong Answer!", "show diff").then(value => {
				if (value === "show diff") {
					let terminal = undefined;
					vscode.window.terminals.forEach(element => {
						if (element.name === "diff") {
							terminal = element;
						}
					}
					);
					if (terminal === undefined) {
						terminal = vscode.window.createTerminal("diff");
					}
					terminal.show();
					let diffCommand = vscode.workspace.getConfiguration("oitest").get("diffCommand");
					terminal.sendText(diffCommand + " " + answerFilePath + " " + outputFilePath);
				}
			});
			return;
		}
		vscode.window.showInformationMessage("Accepted!");
	});
}


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
