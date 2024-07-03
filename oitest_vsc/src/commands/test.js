const vscode = require('vscode');
const fs = require("fs");
const path = require("path");
const { execSync } = require('child_process');

/**
 * 
 * @param {string} problemFilePath 
 * @param {string} problemExePath 
 * @param {string} language 
 * @returns {boolean | string} bool or error info
 */
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
/**
 * 
 * @param {string} problemExePath 
 * @param {string} inputFilePath 输入文件路径
 * @param {string} outputFilePath 输出文件路径
 * @returns {boolean | string} bool or error info
 */
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

/**
 * 
 * @param {string} ans_file 答案文件
 * @param {string} out_file 输出文件
 * @returns {boolean} 是否相同
 */
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


function testProblem() {
	// 获取当前打开的文件
    let editor = vscode.window.activeTextEditor;
    if (editor === undefined) {
        vscode.window.showErrorMessage("Please open a file!");
        return;
    }
    let fileName = editor.document.fileName;
    let problemID = fileName.substring(fileName.lastIndexOf("/") + 1, fileName.lastIndexOf("."));
    console.log(problemID);
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
}

module.exports = {
    testProblem
}