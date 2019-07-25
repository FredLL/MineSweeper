import * as React from "react";
import * as ReactDOM from "react-dom";
import {parse} from "query-string";
import {Game} from "./Game";

let rows = 9;
let cols = 9;
let nbMines = 10;

const parsed = parse(location.search);
if (parsed.rows && typeof parsed.rows == 'string') {
    try {
        rows = parseInt(parsed.rows);
    } catch (e) {}
}
if (parsed.cols && typeof parsed.cols == 'string') {
    try {
        cols = parseInt(parsed.cols);
    } catch (e) {}
}
if (parsed.nbMines && typeof parsed.nbMines == 'string') {
    try {
        nbMines = parseInt(parsed.nbMines);
    } catch (e) {}
}

ReactDOM.render(
    <Game rows={rows} cols={cols} nbMines={nbMines} />,
    document.getElementById('MineSweeper')
);