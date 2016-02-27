import { createStore, applyMiddleware } from 'redux'
import torrentApp from './reducers'
import initClient, { torrentClient } from './middleware/torrentClient'
import initChrome, { chromeApp } from './middleware/chromeApp'

const store = createStore(torrentApp, applyMiddleware(torrentClient, chromeApp))
initClient(store)
initChrome(store)
