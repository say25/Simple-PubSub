// SYEH - 08/05/2020 - Tiny-PubSub - Adapted from https://github.com/LukeWood/tiny-pubsub

interface IPubSubService {
    subscribe<T>(event: string, callback: (data: T) => void): void;
    unsubscribe<T>(event: string, callback: (data: T) => void): void;
    publish(event: string): void;
    publish<T>(event: string, data: T): void;
}

class PubSubService implements IPubSubService {
    private isDebugMode: boolean;
    private readonly subscriptions: { [index: string]: { (data?: any): void }[] };

    constructor() {
        this.isDebugMode = window.localStorage.getItem('pubSubLogs') === 'true';
        this.subscriptions = {};
    }

    /**
     * Toggles the Persistent Debug Mode for PubSub.
     * Intentionally not on the interface as not all PubSub implementers need this
     */
    public toggleDebugMode() {
        var localStorage = window.localStorage;
        var enabled = localStorage.getItem('pubSubLogs') === 'true';
        localStorage.setItem('pubSubLogs', (!enabled).toString());
        this.isDebugMode = !enabled;
    }

    public subscribe<T>(event: string, callback: (data: T) => void): void {
        // SYEH - 08/05/2020 - This is just safety for JS Callers
        if (typeof callback != "function") {
            throw "A non-function can not subscribe to an event";
        }

        const oldSubscriptionsToEvent = this.subscriptions[event] || [];
        oldSubscriptionsToEvent.push(callback);
        this.subscriptions[event] = oldSubscriptionsToEvent;
    }

    public unsubscribe<T>(event: string, callback: (data: T) => void): void {
        const oldSubscriptions = this.subscriptions[event] || [];
        const newSubscriptions = oldSubscriptions.filter(c => c !== callback);
        this.subscriptions[event] = newSubscriptions;
    }

    /**
     * Implements publish(event: string): void and publish(event: string, data: any): void
     *
     * @param event - The event being published
     * @param data - Optional data being sent over the wire
    */
    public publish<T>(event: string, data: T = null): void {
        if (this.isDebugMode) {
            if (data) {
                console.trace(event, data);
            } else {
                console.trace(event);
            }
        }

        const subscriberCallbacks = this.subscriptions[event] || [];

        for (let i = 0; i < subscriberCallbacks.length; i++) {
            // prevent subscriber error from bringing down pubsub
            try {
                subscriberCallbacks[i](data);
            } catch (err) {
                console.error(err);
            }
        }
    } 
}
