class TankScene extends Phaser.Scene {
    /** @type {Phaser.Tilemaps.Tilemap} */
    map
    /** @type {Phaser.Tilemaps.TilemapLayer}*/
    destructLayer
    /**@type {PlayerTank} */
    player
    /**@type {EnemyTank} */
    bossTank
    /**@type {Array.<EnemyTank>} */
    enemyTanks = []
    /**@type {Array} */
    fuelObjects
    /**@type {Array} */
    healthObjects
    /**@type {Phaser.Physics.Arcade.Group} */
    fuelObject
    /**@type {Phaser.Physics.Arcade.Group} */
    bullets
    /**@type {Phaser.Physics.Arcade.Group} */
    enemyBullets
    //TODO CHANGE TO NON PHYSICS
    /**@type {Phaser.GameObjects.Group} */
    explosions
    //PLAYER UI STUFF
    /**@type {HealthBar} */
    healthBar
    /**@type {HealthBar} */
    fuelBar
    preload() {
        this.load.image('bullet', 'assets/tanks/bullet.png')
        this.load.atlas('tank', 'assets/tanks/tanks.png', 'assets/tanks/tanks.json')
        this.load.atlas('enemy', 'assets/tanks/enemy-tanks.png', 'assets/tanks/tanks.json')
        this.load.atlas('enemy2','assets/tanks/enemy-tanks2.png','assets/tanks/tanks.json')
        this.load.atlas('enemy3','assets/tanks/enemy-tanks3.png','assets/tanks/tanks.json')
        this.load.atlas('boss','assets/tanks/boss-tanks.png', 'assets/tanks/tanks.json')
        this.load.image('tileset', 'assets/tanks/landscape-tileset.png')
        this.load.image('fuel','assets/fuel_can.png')
        this.load.image('health','assets/health_pack.png')
        this.load.tilemapTiledJSON('level1', 'assets/level1.json')
        this.load.spritesheet('explosion','assets/tanks/explosion.png',{
            frameWidth:64,
            frameHeight:64
        })
    }
    create() {
        //load in the tilemap
        this.map = this.make.tilemap({ key: 'level1' })
        const landscape = this.map.addTilesetImage('landscape-tileset', 'tileset')
        this.map.createLayer('groundLayer', [landscape], 0, 0)
        this.destructLayer = this.map.createLayer('destructableLayer', [landscape], 0, 0)
        this.destructLayer.setCollisionByProperty({ collides: true })
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels)
        this.physics.world.setBounds(0,0,this.map.widthInPixels, this.map.heightInPixels)
        const objectLayer = this.map.getObjectLayer('objectLayer')
        this.keyF = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F)
        //bullet
        this.enemyBullets = this.physics.add.group({
            defaultKey:'bullet',
            maxSize:10,
        })
        this.bullets = this.physics.add.group({
            defaultKey:'bullet',
            maxSize: 5
        })
        let enemyObjects =[]
        let fuelObjects = []
        let healthObjects = []
        let actor
        objectLayer.objects.forEach(function(object){
            actor = Utils.RetrieveCustomProperties(object)
            if(actor.type =="playerSpawn"){
                this.createPlayer(actor)
            }else if(actor.type == "enemySpawn" ||actor.type =="bossSpawn"){
                enemyObjects.push(actor)
            }
            else if(actor.type=="enemy2Spawn"||actor.type=="enemy3Spawn"){
                enemyObjects.push(actor)
            }
            //boss Spawn
            // else if(actor.type =="bossSpawn"){
            //     console.log('boss')
            //     this.createBoss(actor)
            // }
            else if(actor.type == "fuelSpawn"){
                fuelObjects.push(actor)
            }
            else if(actor.type=="healthSpawn"){
                healthObjects.push(actor)
            }
        }, this)
        for(let i = 0; i< enemyObjects.length; i++){
            this.createEnemy(enemyObjects[i])
        }
        for(let i=0; i< fuelObjects.length; i++){
            this.createFuel(fuelObjects[i])
        }
        for(let i =0;i<healthObjects.length;i++){
            this.createHealth(healthObjects[i])
        }
        //create explosions
        this.explosions = this.add.group({
            defaultKey: 'explosion',
            maxSize:enemyObjects.length+1
        })
        this.anims.create({
            key: 'explode',
            frames:this.anims.generateFrameNumbers('explosion',{
                start:0,
                end:23,
                first:23
            }),
            frameRate: 24
        })
        //camera and UI
        this.cameras.main.startFollow(this.player.hull, true, 0.25, 0.25)
        this.healthText = this.add.text(32,32,'Damage:'+this.player.damageCount*10+'%',{
            fontSize:'16px'
        }).setScrollFactor(0)
        this.fuelText = this.add.text(32,580,'fuel:'+this.player.fuel,{
            fontSize:'16px'
        }).setScrollFactor(0)
        this.input.on('pointerdown', this.tryShoot, this)
        this.physics.world.on('worldbounds', function(body){
            this.disposeOfBullet(body.gameObject)
        }, this)
        //health bar that can use the damage 
        this.healthBar = new HealthBar(this,32,50,this.player.damageCount*150,50, 0xff0000)
        this.fuelBar = new HealthBar(this,32,500, this.player.fuel/5,50,0xffae00)
        
        
    }
    update(time, delta) {
        this.player.update()
        for(let i = 0; i<this.enemyTanks.length;i++){
            this.enemyTanks[i].update(time,delta)
        }
        if (Phaser.Input.Keyboard.JustDown(this.keyF)){
            console.log('f')
        }
        //checks fuel
        if(this.player.fuel<=0){
            this.outOfFuel()
        }
        this.fuelText.setText('Fuel: '+Phaser.Math.FloorTo(this.player.fuel))
        this.fuelBar.draw(this.player.fuel/2)

    }
    createEnemy(dataObject){
        let enemyTank
        if(dataObject.type == 'enemySpawn'){
            enemyTank = new EnemyTank(this, dataObject.x, dataObject.y, 'enemy','tank1', this.player)
        }else if(dataObject.type == 'bossSpawn'){
            enemyTank = new BossTank(this, dataObject.x, dataObject.y, 'boss','tank1', this.player)
        }else if(dataObject.type=='enemy2Spawn'){
            enemyTank = new EnemyTank2(this,dataObject.x, dataObject.y, 'enemy2', 'tank1',this.player)
        }else if(dataObject.type=='enemy3Spawn'){
            enemyTank = new EnemyTank3(this,dataObject.x, dataObject.y, 'enemy3', 'tank1',this.player)
        }
        
        enemyTank.initMovement()
        enemyTank.enableCollision(this.destructLayer)
        enemyTank.setBullets(this.enemyBullets)
        this.physics.add.collider(enemyTank.hull,this.player.hull)
        this.enemyTanks.push(enemyTank)
        if(this.enemyTanks.length>1){
            for(let i = 0; i<this.enemyTanks.length-1; i++){
                this.physics.add.collider(enemyTank.hull,this.enemyTanks[i].hull)
            }
        }
    }
    createPlayer(dataObject){
        this.player = new PlayerTank(this,dataObject.x, dataObject.y, 'tank', 'tank1')
        this.player.enableCollision(this.destructLayer)
    }
    //fuel creattoin and other functions
    createFuel(dataObject){
        let fuelCan
        fuelCan = new FuelPickup(this,dataObject.x,dataObject.y,'fuel')
        this.physics.add.overlap(fuelCan.pickUp,this.player.hull,this.fuelFunction,null,this)
    }
    fuelFunction(fuelCan){
        fuelCan.disableBody(true,true)
        this.player.fuelUp()
    }
    outOfFuel(){
        this.physics.pause()
        this.player.fuel=0
    }
    //health pickup
    createHealth(dataObject){
        let healthPack
        healthPack = new FuelPickup(this,dataObject.x,dataObject.y,'health')
        this.physics.add.overlap(healthPack.pickUp,this.player.hull,this.healthUp,null,this)
    }
    healthUp(healthPack){
        this.healthBar.draw()
        healthPack.disableBody(true,true)
        this.player.damageDown()
    }
    tryShoot(pointer){
        /**@type {Phaser.Physics.Arcade.Sprite} */
        let bullet = this.bullets.get(this.player.turret.x, this.player.turret.y)
        if(bullet){
            this.fireBullet(bullet, this.player.turret.rotation, this.enemyTanks)
        }
    }
    fireBullet(bullet, rotation, target){
        //bullet is a sprite
        bullet.setDepth(3)
        bullet.body.collideWorldBounds=true
        bullet.body.onWorldBounds = true
        bullet.enableBody(false, bullet.x, bullet.y, true, true)
        bullet.rotation = rotation
        this.physics.velocityFromRotation(bullet.rotation, 500, bullet.body.velocity)
        this.physics.add.collider(bullet, this.destructLayer, this.damageWall, null, this)
        if(target === this.player){
            this.physics.add.overlap(this.player.hull, bullet, this.bulletHitPlayer, null, this)
        }
        else{
            for(let i = 0; i<this.enemyTanks.length; i++){
                this.physics.add.overlap(this.enemyTanks[i].hull, bullet, this.bulletHitEnemy,null,this)
            }
        }
    }
    bulletHitPlayer(hull,bullet){
        this.disposeOfBullet(bullet)
        this.player.damage();{
            if(this.player.isDestroyed()){
                this.input.enabled = false
                this.enemyTanks = []
                this.physics.pause()
                let explosion = this.explosions.get(hull.x,hull.y)
                if(explosion){
                    this.activateExplosion(explosion)
                    explosion.play('explode')
                }
            }
        }
        this.healthText.setText('Damage:'+ this.player.damageCount*10+'%')
        console.log(this.healthBar.width)
        //this.healthBar = new HealthBar(this,100,200,this.player.damageCount*20,50)
        this.healthBar.draw(this.player.damageCount*25)
    }
    bulletHitEnemy(hull, bullet){
        /**@type {EnemyTank} */
        let enemy
        /**@type {number} */
        let index
        for(let i = 0; i< this.enemyTanks.length;i++){
            if(this.enemyTanks[i].hull === hull){
                enemy = this.enemyTanks[i]
                index = i
                break
            }
        }
        this.disposeOfBullet(bullet)
        enemy.damage()
        if (enemy.isImobillised()){
            let explosion = this.explosions.get(hull.x, hull.y)
            if(explosion){
                this.activateExplosion(explosion)
                explosion.on('animationcomplete', this.animComplete, this)
                explosion.play('explode')
            }
            if(enemy.isDestroyed()){
                this.enemyTanks.splice(index, 1)
            }
        }
    }
    activateExplosion(explosion){
        explosion.setDepth(5)
        explosion.setActive(true)
        explosion.setVisible(true)
    }
    damageWall(bullet, tile){
        this.disposeOfBullet(bullet)
        //obtain tileset firtgit (used as an offset)
        let firstGid = this.destructLayer.tileset[0].firstgid
        //get next tile id
        let nextTileId = tile.index + 1 - firstGid
        //get next tile prop
        let tileProp = this.destructLayer.tileset[0].tileProperties[nextTileId]
        let newTile= this.destructLayer.putTileAt(nextTileId + firstGid, tile.x,tile.y)
        if(tileProp&&tileProp.collides){
            newTile.setCollision(true)
        }
    }
    disposeOfBullet(bullet){
        bullet.disableBody(true,true)
    }
    animComplete(animation, frame, gameObject){
        this.explosions.killAndHide(gameObject)
    }
    //create boss function using enemy tank for test TO REMOVE OR CHANGE
    // createBoss(dataObject){
    //     this.bossTank = new BossTank(this,dataObject.x, dataObject.y, 'boss', 'tank1')
    // }
    //possible endgame
    endgame(){
        this.physics.pause()
    }
}
