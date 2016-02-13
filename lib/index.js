//import WebTorrent from 'webtorrent'
import { createStore, applyMiddleware } from 'redux'
import torrentApp from './reducers'
import initClient, { torrentMiddleware } from './middleware/torrentClient'
import initChrome, { chromeMessageMiddleware } from './middleware/chromeMessage'

const store = createStore(torrentApp, applyMiddleware(torrentApp, chromeMessageMiddleware))
initClient(store)
initChrome(store)
