import React, { Component } from 'react';
import Legend from './Utils/Legend';
import { c1Dto2D, c2Dto1D } from './Utils/Conversion';
import {
  highlightNode,
  unHighlightNode,
  highlightDiagonals,
  unHighlightDiagonals,
} from './Utils/Highlight';
import Node from './Node/Node';
import { Dijkstra } from './Algorithms/Dijkstra';
import { Maze } from './Maze/Maze';
import './Graph.css';

const ROWS = 37;
const COLS = 37;
const START_NODE_STATE = 1;
const END_NODE_STATE = 2;
const WALL_NODE_STATE = 3;
const SPEED = 25;

export default class Graph extends Component {
  constructor(props) {
    super(props);
    this.state = {
      grid: [],
      modifyingNodeState: 0,
      START_NODE_ROW: 1,
      START_NODE_COL: 1,
      FINISH_NODE_ROW: ROWS - 2,
      FINISH_NODE_COL: COLS - 2,
      disableMazesButton: false,
      disableNodesButton: false,
      disableClearMazeButton: false,
      highlightMazeNodes: true,
      isGridDiagonalsHighlighted: false,
      speed: SPEED,
    };
  }

  componentDidMount() {
    this.setUpGrid();
  }

  setUpGrid() {
    const grid = [];
    const gridBox = document.getElementById('grid');
    gridBox.style.setProperty('--p-grid-rows', ROWS);
    gridBox.style.setProperty('--p-grid-cols', COLS);
    for (let i = 0; i < ROWS; i++) {
      for (let j = 0; j < COLS; j++) {
        grid.push(this.createNode(i, j));
      }
    }
    this.setState({ grid });
  }

  createNode(row, col) {
    const {
      START_NODE_ROW,
      START_NODE_COL,
      FINISH_NODE_ROW,
      FINISH_NODE_COL,
    } = this.state;

    return {
      row,
      col,
      isStart: row === START_NODE_ROW && col === START_NODE_COL,
      isFinish: row === FINISH_NODE_ROW && col === FINISH_NODE_COL,
      distance: Infinity,
      isVisited: false,
      previousNode: null,
    };
  }

  clearBoard() {
    this.setUpGrid();
    const { grid } = this.state;
    for (let i = 0; i < grid.length; i++) {
      const node = grid[i];
      document
        .getElementById(`node-${node.row}-${node.col}`)
        .classList.remove('node-visited');
      document
        .getElementById(`node-${node.row}-${node.col}`)
        .classList.remove('node-shortest-path');
    }
    this.setState({
      disableNodesButton: false,
      disableMazesButton: false,
      highlightMazeNodes: true,
    });
  }

  selectAlgorithm() {
    const algorithm = parseInt(
      document.getElementById('pathFindingAlgoDropDown').value
    );
    if (algorithm === 0) {
      alert('Select an algorithm');
      return;
    }
    this.visualizeAlgorithms(algorithm);
  }

  visualizeAlgorithms(algorithm) {
    this.setState({
      disableClearMazeButton: true,
      disableMazesButton: true,
      disableNodesButton: true,
      modifyNodeState: 0,
    });

    const {
      grid,
      START_NODE_ROW,
      START_NODE_COL,
      FINISH_NODE_ROW,
      FINISH_NODE_COL,
    } = this.state;

    const d2Grid = c1Dto2D(grid, ROWS, COLS);
    const STARTNODE = d2Grid[START_NODE_ROW][START_NODE_COL];
    const FINISHNODE = d2Grid[FINISH_NODE_ROW][FINISH_NODE_COL];

    var visitedNodesInOrder, nodesInShortestPathOrder;
    switch (algorithm) {
      case 0:
        alert('Select an algorithm');
        this.setState({ disableNodesButton: false, disableMazesButton: false });
        return;
      case 1:
        [visitedNodesInOrder, nodesInShortestPathOrder] = Dijkstra(
          d2Grid,
          STARTNODE,
          FINISHNODE
        );
        break;
      default:
        return;
    }
    this.animatePath(visitedNodesInOrder, nodesInShortestPathOrder);
  }

  highlightNodes(row, col) {
    if (this.state.highlightMazeNodes) {
      highlightNode(row, col, ROWS, COLS);
    }
  }

  unHighlightNodes(row, col) {
    if (this.state.highlightMazeNodes) {
      unHighlightNode(row, col, ROWS, COLS);
    }
  }

  highlightDiagonals() {
    if (this.state.isGridDiagonalsHighlighted) {
      const nodes = c1Dto2D(this.state.grid.slice(), ROWS, COLS);
      highlightDiagonals(nodes, ROWS, COLS);
    }
  }

  unHighlightDiagonals() {
    if (this.state.isGridDiagonalsHighlighted) {
      const nodes = c1Dto2D(this.state.grid.slice(), ROWS, COLS);
      unHighlightDiagonals(nodes, ROWS, COLS);
    }
  }

  toggleStartOrFinish(grid = [], row, col, NODE_ROW, NODE_COL, nodeType) {
    const newGrid = grid.slice();
    const currentNode = grid[ROWS * NODE_ROW + NODE_COL];
    const newNode = grid[ROWS * row + col];
    if (nodeType === 'START') {
      if (newNode.isWall || newNode.isFinish) {
        return false;
      } else {
        currentNode.isStart = false;
        newNode.isStart = true;
        this.setState({ grid: newGrid });
        return true;
      }
    } else if (nodeType === 'FINISH') {
      if (newNode.isWall || newNode.isFinish) {
        return false;
      } else {
        currentNode.isFinish = false;
        newNode.isFinish = true;
        this.setState({ grid: newGrid });
        return true;
      }
    } else {
      return false;
    }
  }

  toggleWall(grid, row, col) {
    const newGrid = grid.slice();
    const currentNode = grid[ROWS * row + col];
    if (!currentNode.isStart && !currentNode.isFinish) {
      currentNode.isWall = !currentNode.isWall;
      this.setState({ grid: newGrid });
    }
  }

  handleNodeOperations(row, col, NODE_STATE) {
    const {
      START_NODE_ROW,
      START_NODE_COL,
      FINISH_NODE_ROW,
      FINISH_NODE_COL,
      grid,
    } = this.state;
    switch (NODE_STATE) {
      case 1:
        if (
          this.toggleStartOrFinish(
            grid,
            row,
            col,
            START_NODE_ROW,
            START_NODE_COL,
            'START'
          )
        ) {
          this.setState({
            START_NODE_ROW: row,
            START_NODE_COL: col,
          });
        }
        break;
      case 2:
        if (
          this.toggleStartOrFinish(
            grid,
            row,
            col,
            FINISH_NODE_ROW,
            FINISH_NODE_COL,
            'FINISH'
          )
        ) {
          this.setState({
            FINISH_NODE_ROW: row,
            FINISH_NODE_COL: col,
          });
        }
        break;
      case 3:
        this.toggleWall(grid, row, col);
        break;
      default:
        break;
    }
  }

  modifyingNodeState(STATE) {
    this.setState({ modifyNodeState: STATE });
  }

  generateMaze(grid) {
    this.setState({ disableMazesButton: true, disableClearMazeButton: false });
    const twoDArray = c1Dto2D(grid, ROWS, COLS);
    const mazeGrid = Maze(twoDArray, ROWS, COLS);
    const oneDArray = c2Dto1D(mazeGrid);
    this.setState({ grid: oneDArray });
  }

  animatePath(visitedNodesInOrder, nodesInShortestPathOrder) {
    this.setState({ disableNodesButton: true, highlightMazeNodes: false });
    for (let i = 0; i < visitedNodesInOrder.length; i++) {
      if (i === visitedNodesInOrder.length) {
        setTimeout(() => {
          this.animateShortestPath(nodesInShortestPathOrder);
        }, this.state.SPEED * i);
        return;
      }
      setTimeout(() => {
        const node = visitedNodesInOrder[i];
        if (!node.isStart && !node.isFinish && !node.isWall) {
          document.getElementById(`node -${node.row}-${node.col}`).className =
            'node node-visited';
        }
      }, this.state.SPEED * i);
    }
  }

  animateShortestPath(nodesInShortestPathOrder) {}

  render() {
    const {
      grid,
      modifyingNodeState,
      disableMazesButton,
      disableNodesButton,
      disableClearMazeButton,
    } = this.state;
    return (
      <div>
        <div className='container'>
          <div className='row'>
            <div className='col-sm-7 mb-1'>
              <div className='box shadowT mb-2'>
                <div
                  onMouseOut={() => this.unHighlightDiagonals()}
                  onMouseOver={() => this.highlightDiagonals()}
                  id='grid'
                  className='grid'
                >
                  {grid.map((node, idx) => {
                    const { row, col, isStart, isFinish, isWall } = node;
                    return (
                      <Node
                        key={idx}
                        col={col}
                        isFinish={isFinish}
                        isStart={isStart}
                        isWall={isWall}
                        row={row}
                        onNodeClick={(row, col) =>
                          this.handleNodeOperations(
                            row,
                            col,
                            modifyingNodeState
                          )
                        }
                        onNodeOver={(row, col) => this.highlightNodes(row, col)}
                        onNodeOut={(row, col) =>
                          this.unHighlightNodes(row, col)
                        }
                      />
                    );
                  })}
                </div>
              </div>
            </div>
            <div className='col-sm-5 shadowT rounded-b mb-2 bg-light'>
              <div className='btn-group btn-block mt-2'>
                <button
                  type='button'
                  disabled={disableNodesButton}
                  className='btn bg-start'
                  onClick={() => this.modifyNodeState(START_NODE_STATE)}
                >
                  Place Source
                </button>
                <button
                  type='button'
                  disabled={disableNodesButton}
                  className='btn bg-end'
                  onClick={() => this.modifyNodeState(END_NODE_STATE)}
                >
                  Place Destination
                </button>
                <button
                  type='button'
                  disabled={disableNodesButton}
                  className='btn btn-dark'
                  onClick={() => this.modifyNodeState(WALL_NODE_STATE)}
                >
                  Place Wall
                </button>
              </div>
              <div className='btn-group btn-block mt-2'>
                <button
                  type='button'
                  disabled={disableMazesButton}
                  className='btn btn-secondary'
                  onClick={() => this.generateMaze(grid)}
                >
                  Generate Maze
                </button>
                <button
                  type='button'
                  disabled={disableClearMazeButton}
                  className='btn btn-secondary'
                  onClick={() => this.clearBoard()}
                >
                  Clear Maze
                </button>
              </div>
              <div className='btn-group btn-block mt-2'>
                <div className='input-group'>
                  <select
                    disabled={disableNodesButton}
                    id='pathFindingAlgoDropDown'
                    className='custom-select'
                    defaultValue='0'
                  >
                    <option disabled value='0'>
                      Select Algorithm
                    </option>
                    <option value='1'>Dijkstras</option>
                  </select>
                  <div className='input-group-append'>
                    <button
                      disabled={disableNodesButton}
                      onClick={() => this.selectAlgorithm()}
                      className='btn bg-purple'
                    >
                      Perform Search
                    </button>
                  </div>
                </div>
              </div>
              <Legend />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
