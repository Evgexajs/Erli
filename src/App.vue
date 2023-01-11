<template>
    <div class="wrapper">
        <div class="buttonsWrapper">
            <button class="floating-button" v-on:click="check" style="width: 200px">Выполнить</button>
            <button class="floating-button" v-on:click="pushRule" style="width: 200px">Добавить правило</button>
            <button class="floating-button" v-on:click="deleteRule" style="width: 200px">Удалить правило</button>
            <div style="margin: 20px">
                <input type="checkbox" v-model="space" id="space">
                <label for="space">Учитывыть пробел?</label>
            </div>
            <div style="margin: 20px">
                <input type="checkbox" v-model="isChecking" id="isChecking">
                <label for="isChecking">Проверять при обновлении? (может вызвать ошибки)</label>
            </div>
        </div>
        <div class="center">
            <div>
                <div class="text">Алгоритм Эрли</div>
                <div style="padding-bottom: 10px">
                    <div>Цепочка</div>
                    <input type="text" size="50" :value="chain.join(' ')" @input="setValue('chain', $event)">
                </div>
                <div style="padding-bottom: 10px">
                    <div>Аксиома</div>
                    <div style="display:flex;">
                        <input type="text" size="5" :value="axiom.name" @input="setValue('axiomName', $event)">
                        <input type="text" size="40" :value="axiom.data.join('|')" @input="setValue('axiomData', $event)">
                    </div>
                </div>
                <div style="padding-bottom: 10px" v-for="(rule, index) in rules">
                    <div>Правило {{ index }}</div>
                    <div style="display:flex;">
                        <input type="text" size="5" :value="rule.name" @input="setValue('ruleName', $event, index)">
                        <input type="text" size="40" :value="rule.data.join('|')" @input="setValue('ruleData', $event, index)">
                    </div>
                </div>
            </div>
        </div>
        <div class="areaWrapper">
            <div style="width: min-content; font-size: 30px">Результат</div>
            <textarea style="height: 90vh" class="weswap-current" rows="10" cols="70" name="text" v-model="result"></textarea>
            <textarea style="height: 10vh" class="weswap-current" rows="10" cols="70" name="text" v-model="conclusion" readonly></textarea>
        </div>
    </div>
</template>

<script>
import {Erli} from "@/scripts/Erli/main";

const def = [
    {
        space: false,
        chain: ['cad'],
        axiom: {
            name: 'S',
            data: ['cAd']
        },
        rules: [
            {
                name: 'A',
                data: ['aSb', 'ab', 'a']
            }
        ],
    },
    {
        space: false,
        chain: ['accb'],
        axiom: {
            name: 'S',
            data: ['aQb', 'accb']
        },
        rules: [
            {
                name: 'Q',
                data: ['cSc']
            }
        ],
    },
    {
        space: false,
        chain: ['(*aaaaaa*)'],
        // chain: '(*aaaaa}',
        axiom: {
            name: 'S',
            data: ['C*)', 'K}']
        },
        rules: [
            {
                name: 'C',
                data: ['(*', 'Ca', 'C{', 'C}', 'C(', 'C*', 'C)']
            },
            {
                name: 'K',
                data: ['{', 'Ka', 'K(', 'K*', 'K)', 'K{']
            }
        ],
    },
    {
        space: true,
        chain: ['not', '(', 'true', 'or', 'false', ')'],
        // chain: ['not', 'true', 'true'],
        axiom: {
            name: 'EXPR',
            data: ['EXPR or TERM', 'TERM']
        },
        rules: [
            {
                name: 'TERM',
                data: ['TERM and FACTOR', 'FACTOR']
            },
            {
                name: 'FACTOR',
                data: ['not FACTOR', '( EXPR )', 'true', 'false']
            }
        ],
    },
    {
        space: true,
        // chain: ['if', 'e', 'then', 'c'],
        chain: ['if', 'e', 'then', 'c', 'else'],
        axiom: {
            name: 'STMT',
            data: ['if e then STMT', 'if e then STMT else STMT', 'while e do STMT', 'begin LIST end', 'c']
        },
        rules: [
            {
                name: 'LIST',
                data: ['LIST ; STMT', 'STMT']
            }
        ],
    },
    {
        space: true,
        // chain: ['declare', 'id:', 'real', 'fixed'],
        chain: ['declare', 'id:', 'real', 'declare', 'id', ':'],
        axiom: {
            name: 'STMT',
            data: ['declare id: OPTION_LIST']
        },
        rules: [
            {
                name: 'OPTION_LIST',
                data: ['OPTION_LIST OPTION', 'e']
            },
            {
                name: 'OPTION',
                data: ['MODE', 'SCALE', 'PRECISION', 'BASE']
            },
            {
                name: 'MODE',
                data: ['real', 'complex']
            },
            {
                name: 'SCALE',
                data: ['fixed', 'floating']
            },
            {
                name: 'PRECISION',
                data: ['single', 'double']
            },
            {
                name: 'BASE',
                data: ['binary', 'decimal']
            }
        ],
    }
]
export default {
    name: 'HomeView',
    components: {},
    data() {
        return {
            erli: new Erli(),
            stateList: [],
            space: true,
            result: '',
            conclusion: '',
            isChecking: false,
            status: false,
            ...def[3]
        }
    },
    methods: {
        pushRule: function () {
            this.rules.push({
                name: '',
                data: []
            })
        },
        deleteRule: function () {
            this.rules.pop();
        },
        setValue: function (name, event, index) {
            let el = event.target.value;
            if (name === 'chain') {
                let temp = el ;
                this.chain = temp.split(' ');
            } else if (name === 'axiomName') {
                this.axiom.name = el;
            } else if (name === 'axiomData') {
                let temp = el;
                this.axiom.data = temp.split('|');
            } else if (name === 'ruleName') {
                this.rules[index].name = el;
            } else if (name === 'ruleData') {
                let temp = el;
                this.rules[index].data = temp.split('|');
            }
            this.conclusion = '';
            this.status = false;
            this.result = '';
            this.stateList = [];
            this.erli.setSpace(this.space)
            if (this.isChecking) {
                this.checkChain()
            }
        },
        check: function () {
            this.conclusion = '';
            this.status = false;
            this.result = '';
            this.stateList = [];
            this.erli.setSpace(this.space)
            this.checkChain()
        },
        checkChain: function () {
            //zero
            this.stateList.push({
                indexList: 0,
                elements: this.erli.instructionOne(this.axiom)
            })
            let en = this.stateList[0].elements.length;
            for(let i = 0; i < en; i++) {
                let res = this.erli.instructionThree( this.stateList[0].elements[i], this.axiom, this.rules );
                if (res && !this.erli.checkList(this.stateList[0].elements, this.erli.instructionThree, this.stateList[0].elements[i], this.axiom, this.rules)) {
                    this.stateList[0].elements = this.stateList[0].elements.concat(
                        res
                    )
                    en = this.stateList[0].elements.length;
                }
            }

            this.stateList[0].elements.forEach(el => {
                if (this.erli.instructionFour(el, this.axiom, this.rules)) {
                    if (this.stateList[1] !== undefined) {
                        this.stateList[1].elements = this.stateList[1].elements.concat(
                            this.erli.instructionFour(el, this.axiom, this.rules)
                        )
                    } else {
                        this.stateList.push({
                            indexList: 1,
                            elements: this.erli.instructionFour(el, this.axiom, this.rules)
                        })
                    }
                }
            })
            let tm = this.chain.length === 1 ? this.chain[0].length : this.chain.length;
            for (let i = 1; i <= tm; i++) {
                let end = this.stateList[i].elements.length;
                for (let j = 0; j < end; j++) {
                    if (this.erli.instructionFour(this.stateList[i].elements[j], this.axiom, this.rules).length > 0
                        && (
                            this.stateList[i + 1] === undefined ||
                            !this.erli.checkList(this.stateList[i + 1].elements, this.erli.instructionFour, this.stateList[i].elements[j], this.axiom, this.rules)
                        )) {
                        if (this.stateList[i + 1] !== undefined) {
                            this.stateList[i + 1].elements = this.stateList[i + 1].elements.concat(
                                this.erli.instructionFour(this.stateList[i].elements[j], this.axiom, this.rules)
                            )
                        } else {
                            this.stateList.push({
                                indexList: i + 1,
                                elements: this.erli.instructionFour(this.stateList[i].elements[j], this.axiom, this.rules)
                            })
                        }
                    } else if (this.erli.instructionFive( this.stateList, this.stateList[i].elements[j] ).length > 0
                        && !this.erli.checkList(this.stateList[i].elements, this.erli.instructionFive, this.stateList, this.stateList[i].elements[j])) {
                        this.stateList[i].elements = this.stateList[i].elements.concat(
                            this.erli.instructionFive( this.stateList, this.stateList[i].elements[j] )
                        )
                    } else if (this.erli.instructionSix( this.stateList[i].elements[j] , this.axiom, this.rules, i).length > 0
                        && !this.erli.checkList(this.stateList[i].elements, this.erli.instructionSix, this.stateList[i].elements[j] , this.axiom, this.rules, i)) {
                        this.stateList[i].elements = this.stateList[i].elements.concat(
                            this.erli.instructionSix( this.stateList[i].elements[j] , this.axiom, this.rules, i )
                        )
                    }
                    end = this.stateList[i].elements.length;
                }
            }
            let f = 0
            this.erli.listFormatter(this.stateList, e => {
                // console.log(e)
                this.result += '    ' + e + '\n'
            }, e => {
                // console.log(`${f}. ${e}`)
                this.result += `${f + 1}. ${e}` + '\n'
                f++;
            })
            this.stateList[this.chain.length === 1 ? this.chain[0].length : this.chain.length].elements.forEach(el => {
                let first = this.stateList[0].elements[0];
                if (el.rule === first.rule
                    && (this.erli._getAfterMarker(el) === '' || this.erli._getAfterMarker(el)[0] === '')
                    && el.index === first.index && el.index === 0 && this.status !== true) {
                    this.conclusion = 'Операция: в списке I' + (this.chain.length === 1 ? this.chain[0].length : this.chain.length) + ' ' + this.erli.formatter(el) + '\n'
                        + 'Выполняется условие ω = γ · U [S -> α ·, 0]' + '\n'
                        + 'значит цепочка ω = ' + this.chain.join(' ') + ' выводима';
                    this.status = true;
                }
            })
            if (!this.status) {
                this.conclusion = 'цепочка не выводима';
            }
        },
    },
    mounted() {
        this.erli.setSpace(this.space)
        setTimeout(() => {
            this.checkChain();
        }, 500)
    }

}
</script>

<style>
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

.areaWrapper {
    position: fixed;
    top: 0;
    right: 0;
    display: flex;
    height: 100vh;
    flex-direction: column;
    align-items: center;
    align-self: center;

}

.buttonsWrapper {
    position: fixed;
    top: 45%;
    display: flex;
    flex-direction: column;
}

.center {
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.text {
    font-size: 26px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 10px;
    font-weight: bold;
}

textarea {
    border: 1px solid #888;
}

.weswap-current {
    display: inline-block;
    height: 250px;
    margin: 10px 40px;
    padding: 5px;
    overflow: hidden;
    overflow-y: scroll;
    width: 500px;
}

.weswap-current::-webkit-scrollbar {
    width: 10px;
}

.weswap-current::-webkit-scrollbar-track {
    background-color: #edeadf;
    border-radius: 10px;
}

.weswap-current::-webkit-scrollbar-thumb {
    border-radius: 10px;
    background-color: rgba(46, 157, 150, 0.93);
}

body {
    background-color: #f7ffc4;
    color: #917662;
    font-weight: bold;
    font-size: 20px;
}

.floating-button {
    text-decoration: none;
    display: inline-block;
    width: 140px;
    height: 45px;
    line-height: 45px;
    border-radius: 45px;
    margin: 10px 20px;
    font-family: 'Montserrat', sans-serif;
    font-size: 11px;
    text-transform: uppercase;
    text-align: center;
    letter-spacing: 3px;
    font-weight: 600;
    color: #524f4e;
    background: white;
    box-shadow: 0 8px 15px rgba(0, 0, 0, .1);
    transition: .3s;
}

.floating-button:hover {
    background: #aaffdd;
    box-shadow: 0 15px 20px rgba(78, 213, 160, 0.4);
    transform: translateY(-7px);
}
</style>
