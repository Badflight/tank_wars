class EnemyTank2 extends EnemyTank{
    /**@type {number} */
    shotInterval = 100
    /**@type {number} */
    tankSpeed = 300
    /**@type {number} */
    damageMax = 1
    constructor(scene, x, y, texture, frame, player){
        super(scene, x, y, texture, frame, player)
    }
}