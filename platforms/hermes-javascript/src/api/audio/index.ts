import ref from 'ref'
import ApiSubset from '../ApiSubset'
import {
    PlayBytesMessage
} from '../../casts'
import {
    CPlayBytesMessage,
    CPlayFinishedMessage
} from '../../ffi/typedefs'

/**
 * @experimental
 *
 * Warning: Experimental, use at your own risk!
 */
export default class Audio extends ApiSubset {

    constructor(protocolHandler, call) {
        super(protocolHandler, call, 'hermes_protocol_handler_audio_server_facade')
    }

    publishEvents = {
        play_audio: {
            fullEventName: 'hermes_audio_server_publish_play_bytes',
            messageClass: PlayBytesMessage,
            forgedStruct: CPlayBytesMessage
        }
    }

    subscribeEvents = {
        'play_finished/': {
            fullEventName: 'hermes_audio_server_subscribe_play_finished',
            dropEventName: 'hermes_drop_play_finished_message',
            messageStruct: CPlayFinishedMessage,
            additionalArguments: eventName => [
                ref.allocCString(eventName.substring(14))
            ],
        },
        play_finished_all: {
            fullEventName: 'hermes_audio_server_subscribe_all_play_finished',
            dropEventName: 'hermes_drop_play_finished_message',
            messageStruct: CPlayFinishedMessage
        },
    }

    destroy () {
        this.call('hermes_drop_audio_server_facade', this.facade)
    }
}