var snake = { 'head': null, 'body': [] }

function extend(Child, Parent) {
    var c = Child.prototype;
    var p = Parent.prototype;
    for(var param in p) {
        c[param] || (c[param] = p[param]);
    }
    c.constructor = Child;
    c.uber = p;
}

function checkCrash(ele, targetele) {
    var ep, ew, eh;
    if(ele instanceof Array) {
        ep = {};
        [ep['left'], ep['top'], ew, eh] = ele;
    } else {
        ep = ele.position();
        ew = ele.width();
        eh = ele.height();
    }
    var tp = targetele.position();
    var tw = targetele.width();
    var th = targetele.height();
    return ep.left <= tp.left + tw && ep.left + ew >= tp.left && ep.top <= tp.top + th && ep.top + eh >= tp.top;
}

function checkSnakebodycrash(ele) {
    var crashed = false;
    if(snake['body'].length) {
        for(var i = 0; i < snake['body'].length; i++) {
            if(checkCrash(ele, snake['body'][i].eleBody)) {
                crashed = true;
                break;
            }
        }
    }
    return crashed;
}
function checkSnakeheadcrash(ele) {
    return checkCrash(ele, snake.head.eleBody);
}
function checkSnakecrash(ele) {
    return checkSnakeheadcrash(ele) && checkSnakebodycrash(ele);
}

function  Food(gameIst) {
    this.gameIst = gameIst;
    this.init();
}
Food.prototype = {
    'constructor': Food,
    'size': 10,
    'style': 1,
    'init': function() {
        this.getPositionBorder();
        this.create();
    },
    'getPositionBorder': function() {
        this.maxtop = this.gameIst.gameWrap.height() - this['size'];
        this.maxleft = this.gameIst.gameWrap.width() - this['size'];
    },
    'create': function() {
        var size = this['size'] + 'px';
        this.eleBody = $('<div/>').css({'width': size, 'height': size}).appendTo(this.gameIst.gameWrap).addClass('food');
        this.setPosition();
    },
    'createPosition': function() {
        ftop = Math.random() * this.maxtop;
        fleft = Math.random() * this.maxleft;
        return {'left': fleft, 'top': ftop};
    },
    'setPosition': function() {
        position = this.createPosition();
        if(checkSnakecrash([position.left, position.top, this['size'], this['size']])) {
            return this.setPosition();
        } else {
            console.log([this.maxleft, this.maxtop], [position.left, position.top]);
            this.eleBody.css({'top': position.top, 'left': position.left});
            return this.eleBody;
        }
    },
    'rebirth': function() {
        var random = Math.random();
        position = this.eleBody.position();
        this.eleBody.css({'top': position.top, 'left': position.left});
        // this.setPosition();
        if(random <= 0.2) {
            this['style'] = 2;
            this.eleBody.addClass('food-super');
        } else {
            this['style'] = 1;
            this.eleBody.is('.food-super') && this.eleBody.removeClass('food-super')
        }
    }
}

function Snake() {}
Snake.prototype = {
    'constructor': Snake,
    'size': 10,
    'pastPosition': [],
    'track': [],
    'createBody': function() {
        var size = this.size + 'px';
        this.eleBody = $('<div/>').css({'width': size, 'height': size}).appendTo(this.gameIst.gameWrap).addClass('snake');
    },
    'setPosition': function(arr) {
        this.eleBody.css({'top': arr[0], 'left': arr[1]});
        return this.eleBody;
    },
    'changePosition': function() {
        var position = this.eleBody.position();
        switch(this.direct) {
            case 'right':
                this.setPosition([position.top, position.left + this.gameIst.speed]);
                break;
            case 'down':
                this.eleBody.css('top', position.top + this.gameIst.speed);
                this.setPosition([position.top + this.gameIst.speed, position.left]);
                break;
            case 'left':
                this.setPosition([position.top, position.left - this.gameIst.speed]);
                break;
            case 'up':
                this.eleBody.css('top', position.top - this.gameIst.speed);
                this.setPosition([position.top - this.gameIst.speed, position.left]);
                break;
        }
    }
};

function SnakeHead(gameIst) {
    this.gameIst = gameIst;
    this.init();
}
SnakeHead.prototype = {
    'constructor': SnakeHead,
    'direct': 'right',
    'init': function() {
        this.createBody();
        this.eleBody.addClass('snake-head');
        this.setPosition([0, this['size']]);
        this.addSteeringWheel();
        this.run();
    },
    'addSteeringWheel': function() {
        var _this = this;
        $(document).on('keydown', function(event) {
            var position = _this.eleBody.position();
            if(((event.key === 'a' || event.key === 'd' || event.key === 'ArrowLeft' || event.key === 'ArrowRight') &&
                (_this.direct === 'right' || _this.direct === 'left')) ||
                ((event.key === 'w' || event.key === 's' || event.key === 'ArrowDown' || event.key === 'ArrowUp') &&
                (_this.direct === 'up' || _this.direct === 'down'))) {
                return;
            }
            if(event.key === 'd' || event.key === 'ArrowRight') {
                _this.direct = 'right';
            } else if(event.key === 's' || event.key === 'ArrowDown') {
                _this.direct = 'down';
            } else if(event.key === 'a' || event.key === 'ArrowLeft') {
                _this.direct = 'left';
            } else if(event.key === 'w' || event.key === 'ArrowUp') {
                _this.direct = 'up';
            }
            _this.track.push({'left': position.left, 'top': position.top, 'direct': _this.direct});
        });
    },
    'grow': function(len) {
        for(var i = 0; i < len; i++) {
            snake['body'].push(new SnakeBody(this.gameIst, snake['body'][snake['body'].length - 1]));
        }
    },
    'eatfood': function() {
        console.log('eated');
        if(this.gameIst.food['style'] === 2) {
            this.gameIst.speed += 0.03;
            this.gameIst.score += 3;
            this.grow(3);
        } else {
            this.gameIst.speed += 0.01;
            this.gameIst.score += 1;
            this.grow(1);
        }
        this.gameIst.food.rebirth();
    },
    'tosuicide': function() {
        this.gameIst.gameStatus = 'over';
        console.log('Game over, you score is ' + this.gameIst.score);
    },
    'checkBorder': function() {
        var position = this.eleBody.position();
        if (position.left < 0 ||
            position.top < 0 ||
            position.left > (this.gameIst.gameWrap.width() - this['size']) ||
            position.top > (this.gameIst.gameWrap.height() - this['size'])) {
            this.tosuicide();
        }
    },
    'checkCrash': function() {
        if(this.gameIst.food && checkCrash(this.eleBody, this.gameIst.food.eleBody)) {
            this.eatfood();
        }
        this.checkBorder();
    },
    'pullFollower': function() {
        this.follower && this.follower.refreshPosition();
    },
    'run': function() {
        var _this = this;
        this.runtimer = setInterval(function() {
            if(_this.gameIst.gameStatus === 'over') {
                clearInterval(_this.runtimer);
                return;
            };
            _this.changePosition();
            _this.checkCrash();
            _this.pullFollower();
        }, 1);
    }
};
extend(SnakeHead, Snake);

function SnakeBody(gameIst, leader) {
    this.gameIst = gameIst;
    this.leader = leader;
    this.leader.follower = this;
    this.direct = this.leader.direct;
    this.init();
}
SnakeBody.prototype = {
    'constructor': SnakeBody,
    'init': function() {
        this.createBody();
        this.getPosition();
        // this.run();
    },
    'getPosition': function() {
        position = this.leader.eleBody.position();
        switch(this.direct) {
            case 'right':
                position.left = position.left - this['size'];
                break;
            case 'down':
                position.top = position.top - this['size'];
                break;
            case 'left':
                position.left = position.left + this['size'];
                break;
            case 'up':
                position.top = position.top + this['size'];
                break;
        }
        this.setPosition([position.top, position.left]);
    },
    'pullFollower': function() {
        this.follower && this.follower.refreshPosition();
    },
    'refreshPosition': function() {
        this.getPosition();
        this.pullFollower();
    }
};
extend(SnakeBody, Snake);

function Game() {
    this.init();
}
Game.prototype = {
    'constructor': Game,
    'gameWrap': $('.game-wrap'),
    'gameStatus': 'start',
    'score': 0,
    'speed': 0.3,
    'init': function() {
        this.createSnake();
    },
    'createFood': function() {
        this.food = new Food(this);
    },
    'createSnake': function() {
        snake['head'] = new SnakeHead(this);
        snake['body'].push(new SnakeBody(this, snake['head']));
        this.createFood();
    }
}

$(function() {
    new Game();
});