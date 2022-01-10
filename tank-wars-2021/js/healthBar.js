class HealthBar extends Phaser.GameObjects.Rectangle{
    constructor(scene,x,y,width,height){
        super(scene,x,y,width,height)
        this.bar = new Phaser.GameObjects.Graphics(scene)
        this.x=x
        this.y=y
        this.width=width
        this.height=height
        this.value = 100
        this.p = 76/100
        this.draw();
        scene.add.existing(this.bar);
    }
    draw(){
        this.bar.clear()
        this.bar.fillStyle(0x00ff00)
        this.bar.fillRect(this.x+2, this.y+2,this.width,this.height)
        this.bar.setScrollFactor(0)
    }
}
//health bar tutorial https://phaser.io/examples/v3/view/game-objects/graphics/health-bars-demo 