
import { store } from '../js/core/store.js';
import { apiClient } from '../js/services/api-client.js';

let passed = 0;
let failed = 0;

async function runTests() {
    console.log('STARTING UNIT TESTS');


    const task = store.getState();
    task.sort = 'invalid-sort'; 
    const verify = store.getState();
    if(verify.sort !== 'invalid-sort'){
        console.log("store prevent from directly vlaue chnage!!!!!1")
    }
    
    store.setState({ viewMode: 'list' });
     
    if(store.getState().viewMode === 'list'){
        console.log(" pass :data is updated using setstate funtion only")
    }

}


window.runTests = runTests;