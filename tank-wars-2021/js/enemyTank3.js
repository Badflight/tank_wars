class EnemyTank3 extends EnemyTank{
    /**@type {number} */
    shotInterval = 1000
    /**@type {number} */
    tankSpeed = 50
    /**@type {number} */
    damageMax = 4
    constructor(scene, x, y, texture, frame, player){
        super(scene, x, y, texture, frame, player)
    }
}