class UI {


    ready() {
        return new Promise((resolve, reject) => {
            window.addEventListener('load', function () {
                resolve();
            });
        });
    }

    init(data) {
        this.activities = {};
        this.activityIncrement = 0;
        this.activeRoot = document.createElement('placeholder');
        this.activeNotification = document.createElement('placeholder');


        if (document.getElementsByTagName('containers').length < 1) {
            throw "Missing required element to initialize: 'containers'";
        }
        if (document.getElementsByTagName('activities').length < 1) {
            throw "Missing required element to initialize: 'activities'";
        }
        if (document.querySelectorAll('activity').length < 1) {
            throw "No registered activities found.";
        }
        // if (!('activities' in data)) {
        //     throw "Missing initialization setting: 'Activities'";
        // }

        this.activities = data.activities;

        // Object.keys(data.activities).forEach(a => {
        //     let activityExists = (document.querySelector('activity[name="' + a + '"]') != null);
        //     if(activityExists){
        //         this.activities[a] = data.activities[a];
        //     } else {
        //         throw `Activity '${a}' not found`;
        //     }
        // });

        let hasMainActiviy = false;

        this.sendActivity('main');

    }

    sendActivity(id, data){
        this.activityIncrement++;
        let activities = document.querySelectorAll('activity');
        // let activity = activities.getElementById(id);
        let found = false;
        activities.forEach(a => {
            if(!found){
                if(a.getAttribute('id') === id){
                    found = true;
                    let newActivity = a.cloneNode(true);
                    newActivity.style.zIndex = this.activityIncrement.toString();
                    document.querySelector("containers").appendChild(newActivity);

                    this.activities[id].onRender(newActivity, data);

                    this.activeRoot = newActivity;
                }
            }
        });
    }

    notify(conf, cb){
        let ntfc = document.createElement('notification');
        let ntfcContent = document.createElement('ncontent');

        if('title' in conf){
            let ntfcTitle = document.createElement('ntitle');
            ntfcTitle.innerText = conf.title;
            ntfcContent.appendChild(ntfcTitle);
        } else {
            throw "'title' missing for notification";
        }

        if('text' in conf){
            let ntfcText = document.createElement('ntext');
            ntfcText.innerText = conf.text;
            ntfcContent.appendChild(ntfcText);
        } else {
            throw "'text' missing for notification";
        }

        if('buttons' in conf){
            let ntfcButtons = document.createElement('nbuttons');

            conf.buttons.forEach(b => {
                let ntfcButton = document.createElement('button');

                ntfcButton.innerText = b.text;
                ntfcButton.classList.add('button');
                ntfcButton.classList.add('button-inline');
                ntfcButton.classList.add(b.type);

                ntfcButtons.appendChild(ntfcButton);

                ntfcButton.onclick = () => {
                    b.close();
                };
            });

            ntfcContent.appendChild(ntfcButtons);
        } else {
            throw "'title' missing for notification";
        }

        ntfc.appendChild(ntfcContent);
        this.activeRoot.appendChild(ntfc);
    }

    closeNotification(){
        document.querySelectorAll('notification').forEach(n => {
            n.remove();
        });
    }

    back(reRender = false){
        if(this.activityIncrement > 1){
            this.activityIncrement--;
            let containers = document.querySelector('containers');
            containers.removeChild(containers.lastChild);

            if(reRender){
                let la = containers.lastChild;
                la.innerHTML = "";
                this.activities[la.getAttribute('id')].onRender(la);
            }
        } else {
            throw 'No other activities to go back to';
        }
    }
}