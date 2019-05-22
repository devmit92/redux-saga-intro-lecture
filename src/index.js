import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App/App';
import registerServiceWorker from './registerServiceWorker';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import createSagaMiddleware from 'redux-saga';
import { takeEvery, put } from 'redux-saga/effects';
import logger from 'redux-logger';
import axios from 'axios';

const firstReducer = (state = 0, action) => {
    if (action.type === 'BUTTON_ONE') {
        console.log('firstReducer state', state);
        console.log('Button 1 was clicked!');
        return state + 1;
    }
    return state;
};

const secondReducer = (state = 100, action) => {
    if (action.type === 'BUTTON_TWO') {
        console.log('secondReducer state', state);
        console.log('Button 2 was clicked!');
        return state - 1;
    }
    return state;
};

const elementListReducer = (state = [], action) => {
    switch (action.type) {
        case 'SET_ELEMENTS':
            return action.payload;
        default:
            return state;
    }
};    

// this is the saga that will watch for actions
// function* watcherSaga() {
//     yield takeEvery('SET_ELEMENTS', firstSaga)
// }

// function* firstSaga(action) {
//     console.log('firstSaga was hit: ', action);
// }

function* getElements() {
    try {
        const elementResponse = yield axios.get('/api/element');
        console.log(elementResponse);
        yield put({
            type: 'SET_ELEMENTS',
            payload: elementResponse.data
        })
    } catch (err) {
        console.log('error HELP:', err);
    }
}

function* postElement(action) {
    try {
        yield axios.post('/api/element', action.payload);
        yield put({
            type: 'FETCH_ELEMENTS'
        });
    } catch (err) {
        console.log('error HELP:', err);
    }
}

function* watcherSaga() {
    yield takeEvery('FETCH_ELEMENTS', getElements);
    yield takeEvery('ADD_ELEMENT', postElement);

}

const sagaMiddleware = createSagaMiddleware();

// This is creating the store
// the store is the big JavaScript Object that holds all of the information for our application
const storeInstance = createStore(
    // This function is our first reducer
    // reducer is a function that runs every time an action is dispatched
    combineReducers({
        firstReducer,
        secondReducer,
        elementListReducer,
    }),
    applyMiddleware(sagaMiddleware, logger),
);

sagaMiddleware.run(watcherSaga);

ReactDOM.render(<Provider store={storeInstance}><App/></Provider>, document.getElementById('root'));
registerServiceWorker();
