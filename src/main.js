const scoreLabel = document.getElementById('score');
const linesLabel = document.getElementById('lines');
const levelLabel = document.getElementById('level');

const wall = document.getElementById('wall');
const startWindow = document.getElementById('gamestart');
const startButton = document.getElementById('start');
const endWindow = document.getElementById('gameend');
const endButton = document.getElementById('end');

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const H = 20;
const W = 10;
const scale = 25;
canvas.height = scale * H;
canvas.width = scale * W;

const tetromino = new Array(
    [[0, -1], [0, 0], [0, 1], [0, 2]],
    [[0, 0], [0, 1], [-1, 0], [-1, -1]],
    [[0, -1], [0, 0], [-1, 0], [-1, 1]],
    [[0, 0], [0, 1], [-1, 0], [-1, 1]],
    [[0, -1], [0, 0], [0, 1], [-1, -1]],
    [[0, -1], [0, 0], [0, 1], [-1, 1]],
    [[0, -1], [0, 0], [0, 1], [-1, 0]]
);

async function wait(ms){
    return new Promise(
        (resolve) => {
            setTimeout(() => {resolve();},
            ms)
        }
    );
}

class Tetris {
    constructor(){
        this.board = new Array(H).fill().map(() => new Array(W));
        this.lines = 0;
        this.level = 0;
        this.score = 0;

        this.blockColor = 0;
        this.h = 0;
        this.w = 0;
        this.tet = 0;
    }

    start(){
        this.blockColor = 0;
        for(let i = 0; i < H; i++){
            for(let j = 0; j < W; j++){
                this.board[i][j] = this.blockColor ^ 1;
            }
        }
        this.lines = 0;
        this.score = 0;
        this.level = 0;
        linesLabel.innerText = this.lines;
        scoreLabel.innerText = this.score;
        levelLabel.innerText = this.level;
        this.play();
    }

    async play(){
        let numBlock = 0;
        while(true){
            this.h = 0;
            this.w = W/2-1;
            let index = Math.floor(7 * Math.random());
            this.tet = tetromino[index];
            while(true){
                this.drawBlock();
                await wait(1000 - 90 * this.level);
                if(this.collide(this.h + 1, this.w, this.tet)){
                    for(let i = 0; i < 4; i++){
                        if(this.h + this.tet[i][0] < 0) continue;
                        this.board[this.h + this.tet[i][0]][this.w + this.tet[i][1]] = this.blockColor;
                    }
                    if(this.h == 0){
                        this.end();
                        return;
                    }
                    break;
                }
                this.h++;
            }

            this.clear();

            numBlock++;
            if(numBlock % 10 == 0){
                await this.inverse();
            }
        }
    }

    end(){
        wall.style.visibility = 'visible';
        endWindow.style.visibility = 'visible';
    }

    collide(h, w, tet){
        for(let i = 0; i < 4; i++){
            if(h + tet[i][0] < 0) continue;
            if(H <= h + tet[i][0] || w + tet[i][1] < 0 || W <= w + tet[i][1]) return true;
            if(this.board[h + tet[i][0]][w + tet[i][1]] == this.blockColor) return true;
        }
        return false;
    }

    clear(){
        for(let i = 0; i < H; i++){
            let isComp = true;
            for(let j = 0; j < W; j++){
                if(this.board[i][j] != this.blockColor) isComp = false;
            }
            if(!isComp) continue;

            for(let j = 0; j < W; j++){
                this.board[i][j] = this.blockColor ^ 1;
            }

            this.lines++;
            this.score += 100 + this.level;
            linesLabel.innerText = this.lines;
            scoreLabel.innerText = this.score;
            if(this.lines % 10 == 0 && this.level < 10){
                this.level++;
                levelLabel.innerText = this.level;
            }
        }
        let i = H-1; let j = H-2;
        for(; i > 0; i--, j--){
            let isSpace = true;
            for(let k = 0; k < W; k++){
                if(this.board[i][k] == this.blockColor) isSpace = false;
            }
            if(isSpace){
                for(let k = 0; k < W; k++){
                    this.board[i][k] = this.blockColor ^ 1;
                }
                for(; j >= 0; j--){
                    let hasBlock = false;
                    for(let k = 0; k < W; k++){
                        if(this.board[j][k] == this.blockColor) hasBlock = true;
                    }
                    if(hasBlock){
                        for(let k = 0; k < W; k++){
                            this.board[i][k] = this.board[j][k];
                            this.board[j][k] = this.blockColor ^ 1;
                        }
                        break;
                    }
                }
            }
        }
        this.drawBlock();
    }

    async inverse(){
        this.blockColor ^= 1;
        for(let i = 0; i < H/2; i++){
            for(let j = 0; j < W; j++){
                [this.board[i][j], this.board[H-1-i][W-1-j]] = [this.board[H-1-i][W-1-j], this.board[i][j]]
            }
        }
        this.drawBlock();
        await wait(500);
        for(let i = 0; i < H; i++){
            let isComp = true;
            for(let j = 0; j < W; j++){
                if(this.board[i][j] != this.blockColor) isComp = false;
            }
            if(isComp){
                for(let k = H-1; k >= H-i; k--){
                    for(let j = 0; j < W; j++){
                        this.board[k][j] = this.board[k-H+i][j];
                    }
                }
                for(let k = H-i-1; k >= 0; k--){
                    for(let j = 0; j < W; j++){
                        this.board[k][j] = this.blockColor ^ 1;
                    }
                }
                break;
            }
        }
        this.drawBlock();
    }

    drawBlock(){
        ctx.fillStyle = (this.blockColor == 1 ? 'black' : 'white');
        ctx.fillRect(0, 0, scale * W, scale * H);

        ctx.fillStyle = (this.blockColor == 0 ? 'black' : 'white');
        // wall
        for(let i = 0; i < H; i++){
            for(let j = 0; j < W; j++){
                if(this.board[i][j] == this.blockColor) ctx.fillRect(scale * j, scale * i, scale, scale);
            }
        }
        // tetrimino
        for(let i = 0; i < 4; i++){
            ctx.fillRect(scale * (this.w + this.tet[i][1]), scale * (this.h + this.tet[i][0]), scale, scale);
        }
    }

    rotate(){
        let tetRot = new Array(4);
        for(let i = 0; i < 4; i++){
            tetRot[i] = [this.tet[i][1], -this.tet[i][0]];
        }
        if(!this.collide(this.h, this.w, tetRot)){
            this.tet = tetRot;
            this.drawBlock();
        }
    }

    moveDown(){
        if(!this.collide(this.h + 1, this.w, this.tet)){
            this.h++;
            this.drawBlock();
        }
    }

    moveLeft(){
        if(!this.collide(this.h, this.w - 1, this.tet)){
            this.w--;
            this.drawBlock();
        }
    }

    moveRight(){
        if(!this.collide(this.h, this.w + 1, this.tet)){
            this.w++;
            this.drawBlock();
        }
    }
}

const tetris = new Tetris();

startButton.addEventListener(
    'click',
    function(e){
        wall.style.visibility = 'hidden';
        startWindow.style.visibility = 'hidden';
        tetris.start();
    }
);

endButton.addEventListener(
    'click',
    function(e){
        wall.style.visibility = 'hidden';
        endWindow.style.visibility = 'hidden';
        tetris.start();
    }
);

document.addEventListener(
    'keydown',
    function(e){
        switch(e.key){
            case 'ArrowUp':
                tetris.rotate();
                break;
            case 'ArrowDown':
                tetris.moveDown();
                break;
            case 'ArrowLeft':
                tetris.moveLeft();
                break;
            case 'ArrowRight':
                tetris.moveRight();
                break;
        }
    }
);