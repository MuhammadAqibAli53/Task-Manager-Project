
class EventBus {
    constructor() {
        this.ev = {};
    }

     
    on(en, ls) {
        if (!this.ev[en]) {

            this.ev[en] = [];
        }
        this.ev[en].push(ls);
    }

    off(en, ls) {
        if (!this.ev[en]) return;
        
        this.ev[en] = this.ev[en].filter(e => e !== ls);
    }

    once(en, ls) {
        const o = (...args) => {
            ls(...args);
            this.off(en, o); 
        };
        this.on(en, o);
    }
    
    emit(en, ...args) {
        if (!this.ev[en]){
             return;
        }
        this.ev[en].forEach(ls =>
             {
            try {
                ls(...args);
            } catch (error) {
                console.error(`Error in EventBus ls for ${en}:`, error);
            }
        });
    }
}


export const eventBus = new EventBus();