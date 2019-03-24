class Timings {
    constructor(data, root) {
        this.data = data; // item_length, contents: names: states
        this.rootNode = root;
        for (item of Object.keys(data.contents)) {
            console.log(item);
        }
    }
}
