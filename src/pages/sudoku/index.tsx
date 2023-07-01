import styles from '../../styles/Sudoku.module.css'
import {useState} from 'react'

const load1 = [[0, 0, 4, 0, 5, 0, 0, 0, 0], 
               [9, 0, 0, 7, 3, 4, 6, 0, 0], 
               [0, 0, 3, 0, 2, 1, 0, 4, 9], 
               [0, 3, 5, 0, 9, 0, 4, 8, 0], 
               [0, 9, 0, 0, 0, 0, 0, 3, 0], 
               [0, 7, 6, 0, 1, 0, 9, 2, 0], 
               [3, 1, 0, 9, 7, 0, 2, 0, 0], 
               [0, 0, 9, 1, 8, 2, 0, 0, 3], 
               [0, 0, 0, 0, 6, 0, 1, 0, 0]]

let stop = false;
let delay = 50;

export default function Home() {
    const [board, setBoard] = useState(createEmptyBoard());
    const [index, setIndex] = useState(-1);
    const [delayText, setDelayText] = useState('50');

    return (
      <div className={styles.maincontainer}>
        <h1 className={styles.title}>Sudoku Solver</h1>
        <div className={styles.sudokucontainer}>
            {createBoardRender(board, setBoard, index)}
        </div>
        <div className={styles.buttoncontainer}>
            <button className={styles.sudokubutton} onClick={()=>solveBoard(board, 0, setBoard, setIndex)}>Solve</button>
            <button className={styles.sudokubutton} onClick={()=> setBoard(createEmptyBoard())}>Clear</button>
            <button className={styles.sudokubutton} onClick={()=> stop=true}>Stop</button>
            <button className={styles.sudokubutton} onClick={()=>setBoard(load1)}>Load</button>
        </div>
        <div className={styles.slidercontainer}>
            <h2 className={styles.slidertitle}>Delay</h2>
            <input className={styles.slider} type="range" onChange={(e)=>{delay=parseInt(e.target.value); setDelayText(e.target.value)}}/>
            <h2 className={styles.slidertext}>{delayText}</h2>
        </div>
      </div>
    )
}

function Square ({solveIndex, index, value, board, setBoard}: any) {
    const modifyChange = (e: any) => {
        var newValue = 0;
        if (e.target.value.length == 1) {
            newValue = parseInt(e.target.value)
        } else {
            newValue = parseInt(e.target.value[1])
            if (newValue == 0) {
                newValue = parseInt(e.target.value[0])
            }
        }

        if (isNaN(newValue)) {
            return;
        }
        
        if (newValue < 10 && newValue >= 0){
            setBoard(modifyBoard(board, index, newValue))
        }
    } 

    const backgroundColor = index == solveIndex ? 'cyan' : '#8c6371';
    const textColor = value == 0 ? 'transparent' : 'white';

    return (
        <>
            <input className={styles.square} style={{color: textColor, backgroundColor: backgroundColor}} value={value} onChange={modifyChange} onClick={()=>setBoard(modifyBoard(board, index, 0))}/>
        </>
    )
}

function createBoardRender(board: Array<Array<number>>, setBoard: Function, solveIndex: number) {
    const boardRender = board.map((row, rowIndex) => {
        return (
            <div key={rowIndex}>
                {row.map((item, itemIndex) => {
                    return <Square key={rowIndex * 9 + itemIndex} solveIndex={solveIndex} index={rowIndex*9 + itemIndex} value={item} board={board} setBoard={setBoard}/>
                })}
            </div>
        )
    })
    return (
        boardRender
    )
    
}

function modifyBoard(oldBoard: Array<Array<number>>, editIndex: number, newValue:number) {
    var updatedBoard = [...oldBoard]

    var rowIndex = Math.floor(editIndex / 9)
    var colIndex = editIndex % 9

    updatedBoard[rowIndex] = [...oldBoard[rowIndex]]
    updatedBoard[rowIndex][colIndex] = newValue
    
    return updatedBoard
}

function createEmptyBoard () {
    var board = []
    for (let i = 0; i < 9; i++) {
        var row = []
        for (let j = 0; j < 9; j++) {
            row.push(0)
        }
        board.push(row)
    }
    return board
}

async function solveBoard(board: Array<Array<number>>, currIndex:number, setBoard: Function, setIndex: Function) {
    setIndex(currIndex - 1)

    if (stop == true) {
        setIndex(-1)
        stop = false;
        return 1;
    }
    
    if (!boardValid(board)) {
        return 0;
    }

    
    if (currIndex == 81) {
        setIndex(-1)
        return 2;
    }

    if (board[Math.floor(currIndex / 9)][currIndex % 9] != 0) {
        return solveBoard(board, currIndex + 1, setBoard, setIndex)
    }

    for (let i = 1; i < 10; i++) {
        var modifiedBoard = modifyBoard(board, currIndex, i)
        setBoard(modifiedBoard)

        var result = await new Promise((resolve) => {
            setTimeout(() => {
                resolve(solveBoard(modifiedBoard, currIndex + 1, setBoard, setIndex))
            }, delay)
        })
        
        if (result == 2) {
            setBoard(modifiedBoard)
            setIndex(-1)
            return 1;
        } else if (result == 1) {
            return 1;
        }
    }
    return 0;
}


function boardValid(board: Array<Array<number>>) : boolean {
    //rows
    for (let i = 0; i < 9; i++) {
        var row = board[i]

        var d = new Set();
        for (let j = 0; j < 9; j++) {
            var item = row[j]
            if (item == 0) {
                continue;
            }

            if (d.has(item)) {
                return false;
            }
            d.add(item);
        }
    }

    //columns
    for (let i = 0; i < 9; i++) {
        var d = new Set()
        for (let j = 0; j < 9; j++) {
            var item = board[j][i]
            if (item == 0) {
                continue;
            }
            if (d.has(item)) {
                return false;
            }
            d.add(item);
        }
    }

    //squares
    for (let i = 0; i < 9; i++) {
        var baseRow = 3 * Math.floor(i / 3)
        var baseCol = 3 * (i % 3)

        var d = new Set()
        for (let j = 0; j < 9; j++) {
            var offsetRow = Math.floor(j / 3);
            var offsetCol = j % 3;

            var item = board[baseRow + offsetRow][baseCol + offsetCol]
            if (item == 0) {
                continue;
            }
            if (d.has(item)) {
                return false;
            }
            d.add(item);
        }
    }
    return true;
}
  