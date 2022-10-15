const { Update } = require("lodash");

let elevatorID = 1;
let floorRequestButtonID = 1;
let callButtonID = 1;
class Column {
    constructor(_id, _amountOfFloors, _amountOfElevators) {
        this.ID = _id;
        this.elevatorList = [];
        this.callButtonList = [];
        this.amountOfFloors = _amountOfFloors;
        this.amountOfElevators = _amountOfElevators;
        this.createElevators(_amountOfFloors, _amountOfElevators);
        this.createCallButtons(_amountOfFloors);
    };  
    createCallButtons(_amountOfFloors){
        let buttonFloor = 1;
        for (let i=0; i < _amountOfFloors; i++){
            if (buttonFloor < _amountOfFloors){
                const callButton = new CallButton(callButtonID, buttonFloor, 'up');
                this.callButtonList.push(callButton);
                callButtonID++;
            }
            if (buttonFloor > 1){
                const callButton = new CallButton(callButtonID, buttonFloor, 'down');
                this.callButtonList.push(callButton); 
                callButtonID++;
            }
            
            buttonFloor++;
        }
    }
    createElevators(_amountOfFloors,_amountOfElevators){
        for(let i=1; i<_amountOfElevators+1; i++){
            let elevator = new Elevator(elevatorID, _amountOfFloors, 1);
            this.elevatorList.push(elevator);
            elevatorID++;
        }
    }
    // Simulate when a user press a button outside the elevator
    requestElevator(floor,direction){
        
        let best = this.findElevator(floor,direction);
        best.floorRequestList.push(floor);
        best.move();
        return this.findElevator(floor,direction);
    }
    // We use a score system depending on the current elevators state. Since the bestScore and the referenceGap are 
    // higher values than what could be possibly calculated, the first elevator will always become the default bestElevator, 
    // before being compared with to other elevators. If two elevators get the same score, the nearest one is prioritized.
    findElevator(requestedFloor, requestedDirection){
        let bestElevator = new Object();
        let bestScore =5;
        let referenceGap = 10000000;
        let bestElevatorInformations = new Object();
        for (let elevator of this.elevatorList){
            //The elevator is at my floor and going in the direction I want
            if((requestedFloor === elevator.currentFloor) && (elevator.status === 'stopped') &&(requestedDirection === elevator.direction)) {
                bestElevatorInformations = this.checkIfElevatorIsBetter(1, elevator, bestScore, referenceGap, bestElevator,requestedFloor);
            }
            //The elevator is lower than me, is coming 'Up' and I want to go 'Up'
            else if ((requestedFloor > elevator.currentFloor) && (elevator.direction === 'up') &&(requestedDirection === elevator.direction)){
                bestElevatorInformations = this.checkIfElevatorIsBetter(2, elevator,bestScore, referenceGap, bestElevator, requestedFloor);
            }
            //The elevator is higher than me, is coming 'Down' and I want to go 'Down'
            else if ((requestedFloor < elevator.currentFloor) && (elevator.direction === 'down') &&(requestedDirection === elevator.direction)){
                bestElevatorInformations = this.checkIfElevatorIsBetter(2, elevator,bestScore, referenceGap, bestElevator, requestedFloor);
            }
            //The elevator is idle
            else if (elevator.status === 'idle'){
                bestElevatorInformations = this.checkIfElevatorIsBetter(3, elevator,bestScore, referenceGap, bestElevator, requestedFloor);
            }
            else{
                bestElevatorInformations = this.checkIfElevatorIsBetter(4, elevator, bestScore, referenceGap, bestElevator, requestedFloor);
            }
            bestElevator = bestElevatorInformations.bestElevator;
            bestScore = bestElevatorInformations.bestScore;
            referenceGap = bestElevatorInformations.referenceGap;
       
            };
        return bestElevator;
    }

    checkIfElevatorIsBetter(scoreToCheck, newElevator, bestScore, referenceGap, bestElevator, floor){
        if (scoreToCheck < bestScore){
             bestScore= scoreToCheck;
             bestElevator = newElevator;
             referenceGap = Math.abs(newElevator.currentFloor - floor);
        }
        else if (bestScore == scoreToCheck){
            const gap = Math.abs(newElevator.currentFloor - floor);
            if (referenceGap > gap){
                 bestElevator = newElevator;
                 referenceGap = gap;
            }
        }
        return {bestElevator, bestScore, referenceGap};
    }
}
class FloorRequestButton {
    constructor(_id, _floor) {
        this.ID = _id;
        this.status = 'OFF';
        this.floor = _floor;
    }
}
class Elevator {
    constructor(_id,  _amountOfFloors, _currentFloor) {
        this.ID = _id;
        this.status = 'idle';
        this.currentFloor = _currentFloor;
        this.direction = null;
        this.door = new Door(_id, 'closed');
        this.floorRequestButtonList =[];
        this.floorButtonsList =[];
        this.floorRequestList = [];
        this.createFloorRequestButtons(_amountOfFloors);
    }
    createFloorRequestButtons(_amountOfFloors){
        let buttonFloor = 1;
        for (let i=0; i<_amountOfFloors; i++){
            let floorRequestButton = new FloorRequestButton(floorRequestButtonID, buttonFloor);
            this. floorRequestButtonList.push(floorRequestButton);
            buttonFloor++;
            floorRequestButtonID++;
            }
    }
    //Simulate when a user press a button inside the elevator
    requestFloor(floor){
        this.floorRequestList.push(floor);
        this.move();
    }
    move(){
        while (this.floorRequestList.length != 0 ){
            let destination = this.floorRequestList[0];
            this.status = 'moving';
            if (this.currentFloor < destination){
                this.direction = 'up';
                this.sortFloorList();
                while (this.currentFloor < destination){
                    this.currentFloor++;
                    this.screenDisplay = this.currentFloor;
                }
            }
            else if (this.currentFloor > destination){
                this.direction = 'down';
                this.sortFloorList();
                while (this.currentFloor > destination){
                    this.currentFloor--;
                    this.screenDisplay = this.currentFloor;
                }
            }
            this.status = 'stopped';
            this.floorRequestList.shift();
        }
        this.status = 'idle';
    }
    sortFloorList(){
        if (this.direction === 'up'){
            this.floorRequestList.sort();
        }
        else{
            this.floorRequestList.reverse();
        }
    }
}

class CallButton {
    constructor(_id, _floor, _direction) {
        this.ID = _id;
        this.status = "OFF";
        this.floor = _floor;
        this.direction = _direction;
    }
}
class Door {
    constructor(_id, _status) {
        this.ID = _id;
        this.status = _status;
    }
}

module.exports = { Column, Elevator, CallButton, FloorRequestButton, Door }