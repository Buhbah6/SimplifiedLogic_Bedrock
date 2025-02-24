import { BlockPermutation, world, system } from "@minecraft/server";

/** @type {import("@minecraft/server").BlockCustomComponent} */
const redstoneJunctionDetectionComponent = {
    onTick(event) {
        let directionalInput = [0, 0, 0, 0];
        let direction = event.block.permutation.getState("ican:facing_direction");

        const directionOffsets = [
            { up: "north", down: "south", left: "west", right: "east" }, // North
            { up: "south", down: "north", left: "east", right: "west" }, // South
            { up: "west", down: "east", left: "south", right: "north" }, // West
            { up: "east", down: "west", left: "north", right: "south" }  // East
        ];

        const offsets = directionOffsets[direction];

        directionalInput[0] = event.block[offsets.up](1).typeId != "minecraft:powered_repeater" ? event.block[offsets.up](1).getRedstonePower() : 0; // Up
        directionalInput[1] = event.block[offsets.down](1).typeId != "minecraft:powered_repeater" ? event.block[offsets.down](1).getRedstonePower() : 0; // Down
        directionalInput[2] = event.block[offsets.left](1).typeId != "minecraft:powered_repeater" ? event.block[offsets.left](1).getRedstonePower() : 0; // Left
        directionalInput[3] = event.block[offsets.right](1).typeId != "minecraft:powered_repeater" ? event.block[offsets.right](1).getRedstonePower() : 0; // Right
        compareInputs(directionalInput[0], directionalInput[1], 1, event.block);
        compareInputs(directionalInput[2], directionalInput[3], 2, event.block);
    }
}

world.beforeEvents.worldInitialize.subscribe(({ blockComponentRegistry }) => {
    blockComponentRegistry.registerCustomComponent(
        "ican:redstone_junction_detection",
        redstoneJunctionDetectionComponent
    );
});

function compareInputs(input1, input2, inputVal, block) {
    if ((input1 > input2) || (input1 != undefined && input2 == undefined) && input1 >= 1) {
        block.setPermutation(block.permutation.withState("ican:output" + inputVal, true));
        block.setPermutation(block.permutation.withState("ican:input_direction" + inputVal, 0));
    }
    else if ((input2 > input1) || (input2 != undefined && input1 == undefined) && input2 >= 1) {
        block.setPermutation(block.permutation.withState("ican:output" + inputVal, true));
        block.setPermutation(block.permutation.withState("ican:input_direction" + inputVal, 1));
    }
    else
        block.setPermutation(block.permutation.withState("ican:output" + inputVal, false));

}

/** @type {import("@minecraft/server").BlockCustomComponent} */
const triggerMultiOutputDirectionalComponent = {
    onTick(event) {
        let block1 = null;
        let block2 = null;
        let direction = event.block.permutation.getState("ican:facing_direction");
        let output1 = event.block.permutation.getState("ican:output1");
        let output2 = event.block.permutation.getState("ican:output2");
        let inDirection1 = event.block.permutation.getState("ican:input_direction1");
        let inDirection2 = event.block.permutation.getState("ican:input_direction2");
        let cardinalDirection1 = "north"; // Default, will be updated below
        let cardinalDirection2 = "north"; // Default, will be updated below

        switch (direction) {
            case 0:

                if (inDirection1 == 0) { // Input is Up
                    cardinalDirection1 = "north"
                    block1 = event.block.south(1);
                }
                else {
                    cardinalDirection1 = "south"
                    block1 = event.block.north(1);
                }
                if (inDirection2 == 0) {
                    cardinalDirection2 = "west"
                    block2 = event.block.east(1);
                }
                else {
                    cardinalDirection2 = "east"
                    block2 = event.block.west(1);
                }
                break;
            case 1:
                if (inDirection1 == 0) { // Input is Up
                    cardinalDirection1 = "south"
                    block1 = event.block.north(1);
                }
                else {
                    cardinalDirection1 = "north"
                    block1 = event.block.south(1);
                }
                if (inDirection2 == 0) {
                    cardinalDirection2 = "east"
                    block2 = event.block.west(1);
                }
                else {
                    cardinalDirection2 = "west"
                    block2 = event.block.east(1);
                }
                break;
            case 2:
                if (inDirection1 == 0) { // Input is Up
                    cardinalDirection1 = "west"
                    block1 = event.block.east(1);
                }
                else {
                    cardinalDirection1 = "east"
                    block1 = event.block.west(1);
                }
                if (inDirection2 == 0) {
                    cardinalDirection2 = "south"
                    block2 = event.block.north(1);
                }
                else {
                    cardinalDirection2 = "north"
                    block2 = event.block.south(1);
                }
                break;
            case 3:
                if (inDirection1 == 0) { // Input is Up
                    cardinalDirection1 = "east"
                    block1 = event.block.west(1);
                }
                else {
                    cardinalDirection1 = "west"
                    block1 = event.block.east(1);
                }
                if (inDirection2 == 0) {
                    cardinalDirection2 = "north"
                    block2 = event.block.south(1);
                }
                else {
                    cardinalDirection2 = "south"
                    block2 = event.block.north(1);
                }
                break;
        }

        if (block1 && output1) {
            let newBlock1 = BlockPermutation.resolve("minecraft:powered_repeater", block1.permutation.getAllStates()).withState("minecraft:cardinal_direction", cardinalDirection1);
            block1.setPermutation(newBlock1);
        }
        if (block2 && output2) {
            let newBlock2 = BlockPermutation.resolve("minecraft:powered_repeater", block2.permutation.getAllStates()).withState("minecraft:cardinal_direction", cardinalDirection2);
            block2.setPermutation(newBlock2);
        }
    }
}


world.beforeEvents.worldInitialize.subscribe(({ blockComponentRegistry }) => {
    blockComponentRegistry.registerCustomComponent(
        "ican:trigger_multi_output_directional",
        triggerMultiOutputDirectionalComponent
    );
});
