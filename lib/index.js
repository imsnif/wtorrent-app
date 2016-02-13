//import WebTorrent from 'webtorrent'
import { createStore, applyMiddleware } from 'redux'
import torrentApp from './reducers'
import initClient, { torrentClient } from './middleware/torrentClient'
import initChrome, { chromeMessage } from './middleware/chromeMessage'

const store = createStore(torrentApp, applyMiddleware(torrentClient, chromeMessage))
initClient(store)
initChrome(store)
