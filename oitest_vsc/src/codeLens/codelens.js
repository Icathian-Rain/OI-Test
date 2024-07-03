const {CodeLens, Range} = require('vscode');

class CustomCodeLensProvider {
    provideCodeLenses(document, token) {
        const content = document.getText();
        const matchResults = content.match(/@oitest id=(\d+) lang=(\w+)/);
        if (!matchResults) {
            return [];
        }
        console.log("codelens");
        let codeLensLine= document.lineCount - 1;
        for (let i = document.lineCount - 1; i >= 0; i--) {
            const lineContent = document.lineAt(i).text;
            if (lineContent.indexOf("@oitest code=end") >= 0) {
                codeLensLine = i;
                break;
            }
        }
        console.log(codeLensLine);
        const range = new Range(codeLensLine, 0, codeLensLine, 0);
        const codeLens = new CodeLens(range, {
            title: "Test",
            command: "oitest.testProblem",
            arguments: []
        });
        return [codeLens];
    }

}

module.exports = {
    CustomCodeLensProvider
}