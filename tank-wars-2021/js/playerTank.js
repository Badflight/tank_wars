class PlayerTank extends BaseTank{
    /**@type {number} */
    fuel =500
    /**@type {HealthBar} */
    fuelBar
    constructor(scene,x,y,texture,frame){
        super(scene,x,y,texture,frame)
        this.cursors = scene.input.keyboard.createCursorKeys()
        this.keys = scene.input.keyboard.addKeys({
            w:Phaser.Input.Keyboard.KeyCodes.W,
            a:Phaser.Input.Keyboard.KeyCodes.A,
            d:Phaser.Input.Keyboard.KeyCodes.D,
            s:Phaser.Input.Keyboard.KeyCodes.S,
        })
        this.damageMax = 10
        this.currentSpeed = 0
    }
    update(){
        super.update()
        if (this.keys.w.isDown){
            if(this.currentSpeed< this.tankSpeed){
                this.currentSpeed += 10
            }
            this.fuel-=0.1
        }else if(this.keys.s.isDown){
            if(this.currentSpeed> -this.tankSpeed){
                this.currentSpeed -=10
            }
            this.fuel-=0.1
        }
        else{
            this.currentSpeed *= 0.5
        }
        if(this.keys.a.isDown){
            if(this.currentSpeed> 0){
                this.hull.angle--
            }else{
                this.hull.angle++
            }
        }
        else if(this.keys.d.isDown){
            if(this.currentSpeed>0){
                this.hull.angle ++
            }
            else{
                this.hull.angle --
            }
        }
        this.scene.physics.velocityFromRotation(this.hull.rotation, this.currentSpeed, this.hull.body.velocity)
        const worldPoint = this.scene.input.activePointer.positionToCamera(this.scene.cameras.main)
        this.turret.rotation = Phaser.Math.Angle.Between(this.turret.x, this.turret.y, worldPoint.x, worldPoint.y)
    }
    damage(){
        this.scene.cameras.main.shake(2, 1)
        this.damageCount++
        if(this.isDestroyed()){
            this.burn()
        }
    }
    fuelUp(){
        console.log('fuelUp')
        this.fuel +=100
        if(this.fuel >=500){
            this.fuel = 500
        }
        else{
            
        }
        
    }
    damageDown(){
        this.damageCount -=2
        if(this.damageCount <=0){
            this.damageCount =0
        }
    }
}