class BossTank extends EnemyTank{
    /**@type {number} */
    shotInterval = 500
    /**@type {number} */
    tankSpeed = 300
    /**@type {number} */
    damageMax = 5
    constructor(scene, x, y, texture, frame, player){
        super(scene, x, y, texture, frame, player)
    }
}