import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root'})
export class BHABitGradeService {
    Rows: string[] = [ "", "0", "1", "2", "3", "4", "5", "6", "7", "8" ];
    Characteristics: string[] = [ "", "BC - Broken Cone", "BF - Bond Failure", "BT - Broken Teeth/Cutters", "BU - Balled Up Bit", "CC - Cracked Cone",
                                        "CD - Cone Dragged", "CI - Cone Interference", "CR - Cored", "CT - Chipped Teeth/Cutters", "ER - Erosion",
                                        "FC - Flat Crested Wear", "HC - Heat Checking", "JD - Junk Damage", "LC - Lost Cone", "LN - Lost Nozzle",
                                        "LT - Lost Teeth/Cutters", "NO - No Dull Characteristics", "OC - Off Center Wear", "PB - Pinched Bit",
                                        "PN - Plugged Nozzle/Flow Passage", "RG - Rounded Gauge", "RO - Ring Out", "SD - Shirttail Damage",
                                        "SS - Self-Sharpening Wear", "TF - Tracking", "WO - Washed Out Bit", "WT - Worn Teeth/Cutters" ];
    Location: string[] = [ "", "A - (All Rows)", "N - (Nose Rows)", "M - (Middle Rows)", "G - (Gauge Rows)", "1 - Cone 1", "2 - Cone 2",
                                "3 - Cone 3", "C - Cone (PDC)", "N - Nose (PDC)", "T - Taper (PDC)", "S - Shoulder (PDC)", "G - Gauge (PDC)",
                                "A - All (PDC)" ];
    BearingSeal: string[] = [ "", "N - (Sealed Bearing - Not Able to Grade", "X - PDC", "F - (Sealed Bearing - Seals Failed)", "E - (Sealed Bearing - Seals Effective)",
                                    "1 - (Non-sealed Bearing estimated life)", "2 - (Non-sealed Bearing estimated life", "3 - (Non-sealed Bearing estimated life",
                                    "4 - (Non-sealed Bearing estimated life)", "5 - (Non-sealed Bearing estimated life)", "6 - (Non-sealed Bearing estimated life)",
                                    "7 - (Non-selaed Bearing estimated life)", "8 - (Non-sealed Bearing estimated life)" ];
    Gauge: string[] = [ "", "I - In Gauge", "1 - 1/16\" Out of Gauge", "2 - 1/8\" Out of Gauge", "3 - 3/16\" Out of Gauge", "4 - 1/4\" Out of Gauge", "5 - 5/16\" Out of Gauge",
                                "6 - 3/8\" Out of Gauge","7 - 7/16\" Out of Gauge", "8 - 1/2\" Out of Gauge", "9 - 9/16\" Out of Gauge", "10 - 5/8\" Out of Gauge",
                                "11 - 11/16\" Out of Gauge", "12 - 3/4\" Out of Gauge", "13 - 13/16\" Out of Gauge", "14 - 7/8\" Out of Gauge", "15 - 15/16\" Out of Gauge",
                                "16 - 1\" Out of Gauge" ];
    Reasons: string[] = [ "", "BHA - Change Bottom Hole Assembly", "CM - Condition Mud", "CP - Core Point", "DMF - Downhole Motor Failure", "DP - Drill Plug",
                                "DSF - Drill String Failur", "DST - Drill Stem Testing", "DTF - Downhole Tool Failure", "FM - Formation Change", "HP - Hole Problem",
                                "HR - Hours on Bit", "LIH - Left in Hole", "LOG - Run Logs", "PP - Pump Pressure", "PR - Penetration Rate", "RIG - Rig Repair",
                                "RS - Retrieve Survey", "TD - Total Depth/Casing Depth", "TQ - Torque", "TW - Twist Off", "WC - Weather Conditions", "WO - Washout in Drill String" ];

    constructor(){}

    getBitGradeRowData() {
        return this.Rows.slice();
    }
    getBitGradeCharacteristicsData() {
        return this.Characteristics.slice();
    }
    getBitGradeLocationData() {
        return this.Location.slice();
    }
    getBitGradeBearingSealData() {
        return this.BearingSeal.slice();
    }
    getBitGradeGaugeData() {
        return this.Gauge.slice();
    }
    getBitGradeReasonsData() {
        return this.Reasons.slice();
    }
}