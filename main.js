var dropzone = document.getElementById("hero");
var outputText = document.getElementById("output");
var button = document.getElementById("button");

var fileCount = 0;
var folderCount = 0;

dropzone.addEventListener('dragover', e => {
    e.preventDefault();
});

dropzone.addEventListener('drop', async e => {
    e.preventDefault();
    fileCount = 0;
    folderCount = 0;
    const items = e.dataTransfer.items;

    for (const item of items) {
        const entry = item.webkitGetAsEntry();
        if (entry) {
            const output = await traverseFileTree(entry);
            console.log(output);
            console.log("Files:", fileCount, "Folders:", folderCount);
            outputText.textContent = output;
        }
    }
});

button.addEventListener("click", function() {
    navigator.clipboard.writeText(outputText.textContent)
})

function getIndent(depth) {
    if (depth === 0) return "│".repeat(depth);
    return "    │".repeat(depth) + "──── ";
}

function traverseFileTree(entry, path = "", depth = 0) {
    if (entry.isFile) {
        return new Promise((resolve) => {
            entry.file(file => {
                const ext = file.name.includes(".") ? file.name.split(".").pop().toLowerCase() : "";

                fileCount++;
                const indent = getIndent(depth);
                const result = indent + "File: " + path + file.name;
                resolve(result);
            });
        });
    } else if (entry.isDirectory) {
        return new Promise((resolve) => {
            const indent = getIndent(depth);
            const structure = indent + "Folder: " + path + entry.name;

            folderCount++;
            const reader = entry.createReader();
            reader.readEntries(entries => {
                const array = [];
                for (const ent of entries) {
                    const result = traverseFileTree(ent, path + entry.name + "/", depth + 1);
                    array.push(result);
                }
                Promise.all(array).then(results => {
                    const filtered = results.filter(r => r !== null);
                    const joined = filtered.join("\n");
                    const finalOutput = filtered.length === 0 ? structure : structure + "\n" + joined;
                    resolve(finalOutput);
                });
            });
        });
    }
}