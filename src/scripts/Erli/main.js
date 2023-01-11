export class Erli {
    // el = {
    //     rule: 'S',
    //     marker: {
    //         position: 0
    //     },
    //     text: 'aQb',
    //     index: 0
    // }
    _space = false

    setSpace(space) {
        this._space = space;
    }

    instructionOne(axiom) {
        let list = [];
        for (let i = 0; i < axiom.data.length; i++) {
            let el = {
                rule: axiom.name,
                marker: {
                    position: 0
                },
                text: axiom.data[i],
                index: 0
            };
            list.push(el)
        }
        return list;
    }

    instructionTwo() {
        //TO DO
    }

    instructionThree(el, axiom, rules) {
        let [afterMarker, ind] = this._space ? this._getAfterMarker(el) : [this._getAfterMarker(el), 1];
        let rule = rules.find(rule => rule.name === afterMarker);
        if (rule) {
            let res = [];
            rule.data.forEach(e => {
                res.push({
                    rule: rule.name,
                    marker: {
                        position: 0
                    },
                    text: e,
                    index: 0
                })
            })
            return res;
        }
        return false;

    }

    instructionFour(el, axiom, rules) {
        let res = {
            rule: el.rule,
            marker: {
                position: el.marker.position
            },
            text: el.text,
            index: el.index
        };
        let [afterMarker, ind] = this._space ? this._getAfterMarker(el) : [this._getAfterMarker(el), 1];
        if (rules.find(rule => rule.name === afterMarker)
            || axiom.name === afterMarker
            || el.text.length === el.marker.position) return [];
        res.marker.position += ind;
        return [res];
    }

    instructionFive(list, el) {
        let resList = [];
        if (el.text.length === el.marker.position) {
            list[el.index].elements.forEach(e => {
                let [afterMarker, ind] = this._space ? this._getAfterMarker(e) : [this._getAfterMarker(e), 1];

                if (afterMarker === el.rule) {
                    resList.push({
                        rule: e.rule,
                        marker: {
                            position: e.marker.position + ind
                        },
                        text: e.text,
                        index: e.index
                    })
                }

            })
        }
        return resList;
    }

    instructionSix(el, axiom, rules, index) {
        let resList = [];
        let [afterMarker, ind] = this._space ? this._getAfterMarker(el) : [this._getAfterMarker(el), 1];
        let rule = rules.find(rule => rule.name === afterMarker);
        if (rule) {
            rule.data.forEach(e => {
                resList.push({
                    rule: rule.name,
                    marker: {
                        position: 0
                    },
                    text: e,
                    index: index
                })
            })
        } else if (axiom.name === afterMarker) {
            axiom.data.forEach(e => {
                resList.push({
                    rule: axiom.name,
                    marker: {
                        position: 0
                    },
                    text: e,
                    index: index
                })
            })
        }
        return resList;
    }

    _getAfterMarker(el) {
        if (this._space) {
            let temp = el.text.slice(el.marker.position)
            if (temp[0] === ' '){
                temp = temp.slice(1)
                return [el.text.slice(el.marker.position + 1, el.marker.position + temp.split(' ')[0].length + 1).replaceAll(' ', ''), temp.split(' ')[0].length + 1]
            }
            return [el.text.slice(el.marker.position, el.marker.position + temp.split(' ')[0].length).replaceAll(' ', ''), temp.split(' ')[0].length]
        }
        return el.text.slice(el.marker.position, el.marker.position + 1)
    }

    formatter({rule, marker, text, index}) {
        const right = text.slice(0, marker.position) + ' · ' + text.slice(marker.position);
        return `[${rule} ->${right}, ${index}]`;
    }

    listFormatter(list, callbackList, callbackListIn) {
        list.forEach(el => {
            callbackList(`I${el.indexList}`);
            el.elements.forEach(e => {
                callbackListIn(this.formatter(e))
            })
        })
    }

    checkList(list, instruction, ...data) {
        return list.find(el => {
            let temp = instruction.call(this, ...data)[0]
            if (temp.rule === el.rule && temp.marker.position === el.marker.position
                && temp.text === el.text && temp.index === el.index) {
                return true;
            }
        })
    }
}
