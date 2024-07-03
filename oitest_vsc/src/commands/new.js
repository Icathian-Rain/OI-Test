const vscode = require('vscode');
const fs = require("fs");
const path = require("path");

/**
 * 
 * @param {string} filePath File path
 * @param {string} content Content
 */
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

/**
 * 
 */
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

module.exports = {
    newProblem
}