import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import './App.css'
import { store } from './app/store'
import { Provider } from 'react-redux'
import { Game } from './features/game/Game'

ReactDOM.render(
    <React.StrictMode>
        <Provider store={store}>
            <Game />
        </Provider>
    </React.StrictMode>,
    document.getElementById('root')
)
