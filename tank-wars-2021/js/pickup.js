class FuelPickup {
    constructor(scene, x, y, texture){
        this.scene=scene
        this.pickUp=this.scene.physics.add.image(x,y,texture)
        this.pickUp.setDepth(6)
    }
}