class Marker {
    constructor(markerObj, placeType, placeName, id, inDB) {
        this._markerObj = markerObj;

        this._placeType = placeType;
        this._placeName = placeName;
        this._id = id;

        this._inDB = inDB;
        this._toUpdate = false;
        this._toDelete = false;
        this._toAdd = !inDB;

        google.maps.event.addListener(this.markerObj, 'click', function (event) {
            if (confirm("Delete "+this.getTitle()+" from map?")){
                globeVars.deleteMarker(this.getTitle());
            }
        })
    }

    init() {

    }

    toAdd() {
        if (!this._inDB) {
            this._toAdd = true;
        }
    }

    toUpdate() {
        if (this._inDB) {
            this._toUpdate = true;
        }
    }

    toDelete() {
        if (this._inDB) {
            this._toDelete = true;
        }
        this._toUpdate = false;
        this._toAdd = false;

        this._markerObj.setVisible(false);
    }

    reset(){
        this._inDB = true;
        this._toAdd = false;
        this._toUpdate = false;
        this._toDelete = false;
    }

    get markerObj() {
        return this._markerObj;
    }

    get placeType() {
        return this._placeType;
    }

    get markerID() {
        return this._id;
    }

    get placeName(){
        return this._placeName;
    }

    DBAction(){
        if (this._toAdd){
            return "ADD";
        } else if (this._toDelete) {
            return "DELETE";
        } else if (this._toUpdate){
            return "UPDATE";
        } else {
            return "NOTHING";
        }
    }

    createServerObj(activeMapID) {
        const obj = {
            markerId: this._id,
            mapId: activeMapID,
            placeType: this._placeType,
            placeName: this._placeName.replace("'", "''"),
            placeLat: this._markerObj.getPosition().lat(),
            placeLng: this._markerObj.getPosition().lng(),
        }

        return obj;
    }
}