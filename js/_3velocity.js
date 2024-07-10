let currentReset = new Decimal(0)
unlockVel = 0
lastPoints = new Decimal(0)

addLayer("v", {
    name: "velocity", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "V", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: false,
		points: new Decimal(0),
        pointsTest: new Decimal(0),
        resetting: new Decimal(0),
        resetGain: new Decimal(0),
    }},
    color: "#BBBB00",
    branches: ['i'],
    requires: new Decimal(1e12),
    resource: "velocity", // Name of prestige currency
    baseResource: "time",                 // The name of the resource your prestige gain is based on.
    baseAmount() { return player.i.time },  // A function to return the current amount of baseResource.
    type: "custom", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    getResetGain() {
        if (hasUpgrade('v', 11)) {
            if (hasUpgrade('v', 12)) {
                if (hasUpgrade('v', 21)) {
                    if (getBuyableAmount('v', 12) > 0) {
                        if (hasUpgrade('sf', 42)) {
                            return Decimal.floor(Decimal.log10(player.i.time.pow(5e-4)).times(Decimal.min(player.v.points.pow(2), 1e6)).times(Decimal.log10(player.i.time)))
                        } else {
                            return Decimal.floor(Decimal.log10(player.i.time.pow(2.5e-5)).times(Decimal.min(player.v.points.pow(2), 1e6)).times(Decimal.log10(player.i.time)))
                        }
                    } else {
                        return Decimal.floor(Decimal.log2(Decimal.log10(player.i.time).times(player.v.points.pow(2)).times(Decimal.log10(player.i.time))))
                    }
                } else {
                    return Decimal.floor(Decimal.log2(Decimal.log10(player.i.time).times(player.v.points.pow(2))))
                }
            } else {
                return Decimal.floor(Decimal.log2(Decimal.log10(player.i.time)))
            } 
        } else {
            return Decimal.floor(Decimal.ln(Decimal.log10(player.i.time)).div(Decimal.ln(12)))
        }
    },
    getNextAt() {
        if (hasUpgrade('v', 11)) {
            if (hasUpgrade('v', 12)) {
                if (hasUpgrade('v', 21)) {
                    if (getBuyableAmount('v', 12) > 0) {
                        if (hasUpgrade('v', 42)) {
                            return Decimal.pow(10, getResetGain(this.layer).add(1).div(Decimal.min(player.v.points.pow(2), 1e6)).div(Decimal.log10(player.i.time))).pow(2000)
                        } else {
                            return Decimal.pow(10, getResetGain(this.layer).add(1).div(Decimal.min(player.v.points.pow(2), 1e6)).div(Decimal.log10(player.i.time))).pow(40000)
                        }
                    } else {
                        return Decimal.pow(10, Decimal.pow(2, getResetGain(this.layer).add(1)).div(player.v.points.pow(2)).div(Decimal.log10(player.i.time)))
                    }
                } else {
                    return Decimal.pow(10, Decimal.pow(2, getResetGain(this.layer).add(1)).div(player.v.points.pow(2)))
                }
            } else {
                return Decimal.pow(10, Decimal.pow(2, getResetGain(this.layer).add(1)))
            }
        } else {
            return Decimal.pow(10, Decimal.pow(12, getResetGain(this.layer).add(1)))
        }
    },
    canReset() {
        return getResetGain(this.layer) > 0 && player.i.time.gte(1e12)
    },
    prestigeButtonText() {
        if (getResetGain(this.layer) < 100) return "Reset for +"+format(getResetGain(this.layer))+" velocity<br><br>"+format(player.i.time)+" / "+format(getNextAt(this.layer))+" time"
        else return "Reset for +"+format(getResetGain(this.layer))+" velocity"
    },
    effectDescription() { 
        return "which are boosting Number production by ^"+format(Decimal.min(player.v.points.times(10).add(1), 100))+" / ^100.00, and Infinity and Machine production by x"+format(Decimal.min((Decimal.pow(10, Decimal.pow(1.1, player.v.points))).times(player.v.pointsTest).add(new Decimal(1).sub(player.v.pointsTest)), 1e300))+" / x1.00e300 (Infinity boost however limiting to 100,000)"
    },
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    row: 2, // Row the layer is in on the tree (0 is the first row)
    layerShown(){return unlockVel = 1},

    update() {
        if (hasUpgrade('i', 23)) {
            unlockVel = 1
        }

        if (player.v.best > 0) player.v.pointsTest = new Decimal(1)

        if (hasUpgrade('sf', 35) && player.v.resetGain.gte(1) && !isNaN(player.v.resetGain)) player.v.points = player.v.points.add(player.v.resetGain.times(0.001))
    },

    tabFormat: {
        "Main": {
            content: [
                "main-display",
                "prestige-button", "blank",
                ["display-text",
                    function() { return 'You have '+format(player.i.time)+" time" }
                ],
                ["display-text",
                    function() { if (hasUpgrade('v', 11)) return "(You need at least 1e12 time for the prestige button to work)" }, {"color": "#BBBB00"}
                ], "blank",
                ["toggle", ["v", "auto"]],
                ["display-text",
                    function() { return '(Buy a specific upgrade to unlock the auto-buyer toggle above)' }
                ], "blank",
                "milestones", "blank"
            ]
        },
        "Upgrades": {
            content: [
                "main-display",
                ["display-text",
                    function() { return '<b>Velocity Upgrades</b>' }, {"font-size": "32px", "color": "#BBBB00"}
                ], "blank",
                "upgrades", "blank",
            ],
        },
        "Laboratory": {
            content: [
                "main-display",
                ["display-text",
                    function() { return '<b>Time Enhancements</b>' }, {"font-size": "32px", "color": "#BBBB00"}
                ], "blank",
                "buyables", "blank",
            ],
            unlocked() {return hasUpgrade('v', 22)}
        },
    },

    doReset(resettingLayer) {
        player.v.resetGain = player.v.points.sub(lastPoints)
        lastPoints = player.v.points
        player.i.time = new Decimal(0);
		let keep = [];
        if (hasUpgrade('sf', 53)) keep.push("milestones");
		if (layers[resettingLayer].row > this.row)  {
            layerDataReset(this.layer, keep);
            player.v.points = new Decimal(100)
            player.v.resetGain = new Decimal(0)
        }
	},

    hotkeys: [
        {key: "v", description: "V: Reset for velocities", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],

    milestones: {
        0: {
            requirementDescription: "1 velocities",
            effectDescription: "Keep number upgrades and buyables on all resets.",
            done() { return player.v.points.gte(1) || hasUpgrade('sf', 33) }
        },
        1: {
            requirementDescription: "3 velocities",
            effectDescription: "Keep machines upgrades on velocity.",
            done() { return player.v.points.gte(3) || hasUpgrade('sf', 33) }
        },
        2: {
            requirementDescription: "5 velocities",
            effectDescription: "Auto-buy infinity upgrades.",
            done() { return player.v.points.gte(5) || hasUpgrade('sf', 33) }
        },
        3: {
            requirementDescription: "10 velocities",
            effectDescription: "Infinities starts at 20,000.",
            done() { return player.v.points.gte(10) || hasUpgrade('sf', 33) }
        },
        4: {
            requirementDescription: "15 velocities",
            effectDescription: "Keep infinity row 3 upgrades unlocked on all reset.",
            done() { return player.v.points.gte(15) || hasUpgrade('sf', 33) }
        },
    },

    upgrades: {
        11: {
            title: "Immensive Growth",
            description: "Make the velocity formula much better.",
            cost: new Decimal(20),
        },
        12: {
            title: "Speed Synergize",
            description: "Increase velocity gain by velocity.",
            unlocked() {return hasUpgrade('v', 11)},
            cost: new Decimal(50),
        },
        21: {
            title: "Time Synergize",
            description: "Increase velocity gain by time.",
            unlocked() {return hasUpgrade('v', 12)},
            cost: new Decimal(200),
        },
        22: {
            title: "Scientific Revolution",
            description: "Unlock a new tab.",
            unlocked() {return hasUpgrade('v', 21)},
            cost: new Decimal(500),
        },
        31: {
            title: "Everlasting Ladder",
            description: "Each velocity OOM power time gain by 2.",
            unlocked() {return hasUpgrade('v', 22)},
            cost: new Decimal("1e90"),
        },
    },

    buyables: {
        11: {
            cost(x) { 
                if (getBuyableAmount('e', 11) < 100) {
                    if (!hasChallenge('bl', 11)) return new Decimal(10).pow(getBuyableAmount(this.layer, 11).div(new Decimal(3)).add(1)).times(10).div(Decimal.pow(1e5, getBuyableAmount('e', 12)))
                        else return new Decimal(10).pow(getBuyableAmount(this.layer, 11).div(new Decimal(4.5)).add(1)).times(10).div(Decimal.pow(1e5, getBuyableAmount('e', 12)))
                } else {
                    if (!hasChallenge('bl', 11)) return new Decimal(12).pow(getBuyableAmount(this.layer, 11).sub(new Decimal(99)).div(new Decimal(3)).add(1)).times(new Decimal(10).pow(new Decimal(100).div(new Decimal(3)).add(1))).times(10).div(Decimal.pow(1e5, getBuyableAmount('e', 12)))
                        else return new Decimal(12).pow(getBuyableAmount(this.layer, 11).sub(new Decimal(99)).div(new Decimal(4.5)).add(1)).times(new Decimal(10).pow(new Decimal(100).div(new Decimal(4.5)).add(1))).times(10).div(Decimal.pow(1e5, getBuyableAmount('e', 12)))
                }
            },
            title: "Time Dilation I",
            display() { return "Increase time base gain.<br><br>Cost: "+format(this.cost(getBuyableAmount(this.layer, this.id)))+" velocity<br>Bought: "+Decimal.floor(format(getBuyableAmount(this.layer, this.id)))+"/250" },
            canAfford() { return player.v.points.gte(this.cost()) },
            buy() {
                player.v.points = player.v.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            purchaseLimit: 250,
        },
        12: {
            cost(x) { return new Decimal(600) },
            title: "Accerlation Engine",
            display() { return "Make the velocity formula exponential, but apply a hardcap for Velocity Upgrade 2.<br><br>Cost: "+format(this.cost(getBuyableAmount(this.layer, this.id)))+" velocity<br>Bought: "+Decimal.floor(format(getBuyableAmount(this.layer, this.id)))+"/1" },
            canAfford() { return player.v.points.gte(this.cost()) },
            buy() {
                player.v.points = player.v.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() {return getBuyableAmount('v', 11) > 0},
            purchaseLimit: 1,
        },
        21: {
            cost(x) { 
                if (getBuyableAmount('e', 11) < 15) {
                    return new Decimal(10).pow(getBuyableAmount(this.layer, 21).times(new Decimal(1.5)).add(1)).times(10).div(Decimal.pow(1e5, getBuyableAmount('e', 12)))
                } else {
                    return new Decimal(20).pow(getBuyableAmount(this.layer, 21).sub(new Decimal(99)).times(new Decimal(1.5)).add(1)).times(new Decimal(10).pow(new Decimal(100).times(new Decimal(1.8)).add(1))).times(10).div(Decimal.pow(1e5, getBuyableAmount('e', 12)))
                }
            },
            title: "Time Dilation II",
            display() { return "Increase Machine Upgrade 1 limit.<br><br>Cost: "+format(this.cost(getBuyableAmount(this.layer, this.id)))+" velocity<br>Bought: "+Decimal.floor(format(getBuyableAmount(this.layer, this.id)))+"/50" },
            canAfford() { return player.v.points.gte(this.cost()) },
            buy() {
                player.v.points = player.v.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            unlocked() {return getBuyableAmount('v', 12) > 0},
            purchaseLimit: 50,
        },
    },

    autoPrestige() { return (player.v.auto && hasUpgrade("sf", 32)) },
})