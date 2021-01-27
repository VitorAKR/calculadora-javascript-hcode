class CalcController{
    //regras de negócio aqui

    constructor(){
        //usa-se this pois você usará ela dentro de toda a instancia da class
        // existe uma convesnsão de usar "_" em atributos privados
        this._audio = new Audio('click.mp3');
        this._audioOnOff = false;
        this._lastOperator = '';
        this._lastNumber = '';
        this._operation = [];
        this._locale = 'pt-BR';
        this._displayCalcEl = document.querySelector("#display");
        this._dateEl = document.querySelector("#data");
        this._timeEl = document.querySelector("#hora");
        this._currentDate;
        this.initialize();
        this.initButtonsEvents();
        this.initKeyboard();

    }

    initialize(){
        this.setDisplayDateTime();
        //rodar um código em determinado intervalo de tempo (milisegundos)
        setInterval(() => {
            this.setDisplayDateTime();
        }, 1000); //a cada 1 segundo

        //timeOut pra rodar algo depois de certo tempo
        /*setTimeout(() => {
            alert("Olá, já se passou 10 segundos");
        }, 10000); */

        //atualizar display
        this.setLastNumberToDisplay();
        //chamar outros eventos
        this.pasteFromClipboard();

        document.querySelectorAll('.btn-ac').forEach(btn=>{
            //add som na calculadora ao apertar duas vezes no ac
            btn.addEventListener('dblclick', e=>{
                this.toggleAudio();
            });
        });

    }

    toggleAudio(){
        this._audioOnOff = !this._audioOnOff;
        //ou
        //this._audioOnOff = (this._audioOnOff) ? false : true;
        //ou
      /*if(this._audioOnOff){
            this._audioOnOff = false;
        }else{
            this._audioOnOff = true
        } */
    }

    playAudio(){
        if(this._audioOnOff){
            //pra poder reiniciar o audio mais rapido, inicia em zero
            this._audio.currentTime = 0;
            this._audio.play();
        }
    }

    pasteFromClipboard(){
        //function pra colar vindo do clipboard
        document.addEventListener('paste', e=>{
            let text = e.clipboardData.getData('Text');

            if(isNaN(parseFloat(text))){
                //se o conteúdo colado não for número escreve (Easter Egg)
                this.displayCalc = "Deu Ruim";
            }else{
                this.displayCalc = parseFloat(text);
            }

        });
    }

    copyToClipboard(){
        //function pra copiar 
        let input = document.createElement('input');

        input.value = this.displayCalc;
        //add essa nova estrutura pro document do site
        document.body.appendChild(input);

        input.select();

        document.execCommand("Copy");
        //assim que terminar de copiar retira o input
        input.remove();

    }

    initKeyboard(){
        //método pra capturar teclas
        document.addEventListener('keyup',e=>{
            //pra ver a tecla em texto
            //console.log(e.key);
            //chamar audio se estiver habilitado
            this.playAudio();

            switch(e.key){
                case 'Escape':
                  //limpar tudo
                  this.clearAll();
                    break;
                case 'Backspace':
                  //limpar ultimo registro
                  this.clearEntry();  
                    break;
                case '+':
                case '-':
                case '/':
                case '*':
                case '%':
                    this.addOperation(e.key);
                    break;
                case 'Enter':
                case '=':
                    this.calc();
                    break;
                case '.':
                case ',':
                    this.addDot();
                    break;
                case '0':
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                  //pra todos os números, não colocar break nos cases pra lógica pegar em todos eles
                  this.addOperation(parseInt(e.key));
                    break;
                case 'c':
                case 'C':
                    if(e.ctrlKey) this.copyToClipboard();
                    break;
            }

        });

    }
    
    addEventListenerAll(element, events, fn){
        //function pra múltiplos eventos por elementos
        events.split(' ').forEach(event =>{
            element.addEventListener(event, fn, false);
        });
    }

    clearAll(){
        //reinicializa o array e zera variaveis
        this._operation = [];
        this._lastNumber = '';
        this._lastOperator = '';

        //atualizar display
        this.setLastNumberToDisplay();
    }

    clearEntry(){
        //pop retira o ultimo valor inserido no array
        this._operation.pop();

        //atualizar display
        this.setLastNumberToDisplay();
    }

    setError(){
        this.displayCalc = "error";
    }

    getLastOperation(){
        return this._operation[this._operation.length-1];
    }

    setLastOperation(value){
        this._operation[this._operation.length -1] = value;
    }

    isOperator(value){
        //verifica se é um dos indices com operadores iguais aos armazenados nesse array
        //indexOf já retorna true ou false
        return (['+','-','*','%','/'].indexOf(value) > -1);

    }

    pushOperation(value){
        this._operation.push(value);

        //pra respeitar a precedência de operadores
        //precisamos ir calculando os pares já informados na calculadora
        if(this._operation.length > 3){
          //se tiver pares com operando, preciso GUARDAR ultimo operador com pop
          //e calcular o valor da expressão restante e guardar essa informação no array novamente

          this.calc();
        }

    }

    getResult(){
        //circundar com try-catch, pois pode estourar erro na console fazendo "2+="
        try{
            return eval(this._operation.join(""));
        }catch(e){
            //console.log(e);
            setTimeout(() => {
                this.setError();
            }, 1);
            
        }
        
    }

    calc(){
        let last = '';
        //preciso guardar o último número/operador caso clicar mais de uma vez no igual
        this._lastOperator = this.getLastItem(); //true por padrão pra pegar operador

        if(this._operation.length < 3){
           let firstItem = this._operation[0];
           this._operation = [firstItem, this._lastOperator, this._lastNumber]; 
        }

        if(this._operation.length > 3){
           last = this._operation.pop();     
           this._lastNumber = this.getResult();

        }else if(this._operation.length === 3){
            this._lastNumber = this.getResult(false);
        }

        // join() vai juntar as informações do array com "" ao contrário do split()
        //uma vez que a expressão está pronta, basta usar eval(), pro JS interpretar isso
        let result = this.getResult();

        if(last == '%'){
            //tratar a porcentagem pra não fazer mod
           // result = result / 100; //ou
           result /= 100;

           this._operation = [result];

        }else{
            
            //recriar array com os resultados
            this._operation = [result];

            //se tiver valor no last adiciona no array
            if(last) this._operation.push(last);
        }

       //atualizar display
        this.setLastNumberToDisplay();
    }

    getLastItem(isOperator = true){
        let lastItem;
        //preciso pegar o último valor gerado
        //percorrer de trás pra frente, com a última posição como i
        //e parando isso assim que achar o número
        for(let i = this._operation.length -1; i >= 0; i--){
            //se operador for igual a true
                if(this.isOperator(this._operation[i]) == isOperator){
                    lastItem = this._operation[i];
                    break;
                }
        }

        //não encontrou, continua com o último do atributo
        //se for true estamos procurando o último operador, senão é o último número
        //Nota: em if ternário "?" é o "então" e ":" é o senão
        if(!lastItem){
           lastItem = (isOperator) ? this._lastOperator : this._lastNumber; 
        }


        return lastItem;
    }


    setLastNumberToDisplay(){
        //precisa ser false aqui pois procura-se o número
        let lastNumber = this.getLastItem(false);

        //verifica se isso é vazio pra colocar 0 como padrão
        if(!lastNumber) lastNumber = 0;

        this.displayCalc = lastNumber;
    }

    addOperation(value){

        //verifica se o ultimo operador é número ou não
        if(isNaN(this.getLastOperation())){
            
                if(this.isOperator(value)){
                    //trocar operador
                    this.setLastOperation(value);

                }else{
                    this.pushOperation(value);
                    //atualizar display
                    this.setLastNumberToDisplay();
                }

        }else{
            //número

            if(this.isOperator(value)){
                //se for um operador, adiciona mais um item 
                this.pushOperation(value);
            }else{
                let newValue = this.getLastOperation().toString() + value.toString();
                //push add um item no array ao final do array
                this.setLastOperation(newValue);

                //atualizar display
                this.setLastNumberToDisplay();
            }
        }

    }

    addDot(){

        let lastOperation = this.getLastOperation();

        //verificar se já possui ponto pra não deixar uma segunda vez
        //SE HOUVER PONTO É RETORNADO QTDE MAIOR QUE -1 
        if(typeof lastOperation === 'string' && lastOperation.split('').indexOf('.') > -1) return;

        if(this.isOperator(lastOperation) || !lastOperation){
            this.pushOperation('0.');
        }else{
            this.setLastOperation(lastOperation.toString() + '.');
        }

        this.setLastNumberToDisplay();

    }
    
    execBtn(value){
        //chamar audio se estiver habilitado
        this.playAudio();

        switch(value){
            case 'ac':
              //limpar tudo
              this.clearAll();
                break;
            case 'ce':
              //limpar ultimo registro
              this.clearEntry();  
                break;
            case 'soma':
                this.addOperation('+');
                break;
            case 'subtracao':
                this.addOperation('-');
                break;
            case 'divisao':
                this.addOperation('/');
                break;
            case 'multiplicacao':
                this.addOperation('*');
                break;
            case 'porcento':
                this.addOperation('%');
                break;
            case 'igual':
                this.calc();
                break;
            case 'ponto':
                this.addDot();
                break;
            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
              //pra todos os números, não colocar break nos cases pra lógica pegar em todos eles
              this.addOperation(parseInt(value));
                break;
           default:
                this.setError();
                break;
        }
    }

    initButtonsEvents(){
        //preciso pegar a class com tag g tanto em parts quanto buttons
        //pra adicionar eventos em ambos
        let buttons = document.querySelectorAll("#buttons > g, #parts > g");

        //percorrer botões e add os eventos pra cada um deles
        //pegar não só o button como tbm o index de cada button
        //Exemplo: <g class="btn-1"></g> usando console.log(btn);
        buttons.forEach((btn, index) =>{

                //suporta um evento por vez nativamente
                /*btn.addEventListener('click', e=>{
                        //tratar o nome da classe do button
                        console.log(btn.className.baseVal.replace("btn-",""));
                }); */

            //faremos um método pra múltiplos eventos, com split pra separar mais de um evento
            this.addEventListenerAll(btn, 'click drag', e=>{
                //tratar o nome da classe do button
                let textBtn = btn.className.baseVal.replace("btn-","");

                this.execBtn(textBtn);
            });

            this.addEventListenerAll(btn, 'mouseover mouseup mousedown', e=>{
                //fazendo aquele método, você pode interagir com o mouse mudando cursor sob os botões
                btn.style.cursor = "pointer";
            });
        });

    }

    setDisplayDateTime(){
        this.displayDate = this.currentDate.toLocaleDateString(this._locale, {day: "2-digit", month: "long", year: "numeric"});
        this.displayTime = this.currentDate.toLocaleTimeString(this._locale);
    }

    //getters n setters
    get displayCalc(){
        return this._displayCalcEl.innerHTML;
    }

    set displayCalc(value){
        //precisa converter pra String senão ainda vai estourar
        if(value.toString().length > 10){
            this.setError();
            return false; //return false pra sair do método
        }

        this._displayCalcEl.innerHTML = value; 
    }

    get currentDate(){
        return new Date();
    }

    set currentDate(value){
        this._currentDate = value;
    }

    
    get displayTime(){
        return this._timeEl.innerHTML;
    }

    set displayTime(value){
        this._timeEl.innerHTML = value;
    }

    get displayDate(){
        return this._dateEl.innerHTML;
    }

    set displayDate(value){
        this._dateEl.innerHTML = value
    }
}