export const Comp01Subs = `
1
00:00:00,000 --> 00:00:00,001
BPM100


2
00:00:01,000 --> 00:00:02,001
BPM100
ANNOUNCE {"text":"Welcome to our show","duration":3}
    
ANIMATE sharkLeft {"animationName":"swim", "loop":true, "duration":3} 

ANIMATE speakerTest {"animationName":"L1", "loop":true} 

ANIMATE sharkRight {"animationName":"bite","bpm":1} 
//ANIMATE sharkLeft {"animationName":"swim", "duration":1}

ANIMATE multiLight {"animationName":"L2"} 



2
00:00:02,000 --> 00:00:03,001
BPM100

 

ANIMATE multiLight {"animationName":"L4"} 
ANIMATE multiLight2 {"animationName":"L4"}  


2
00:00:03,000 --> 00:00:04,001   
BPM300
ANIMATE multiLight {"animationName":"L6"} 
ANIMATE multiLight2 {"animationName":"L6"}  

ANIMATE speakerTest {"animationName":"L1", "loop":true,"bpmSync":true}  

//KEEP_ROTATING multiLight2 {x:0,y:180,z:0} 

2
00:00:05,000 --> 00:00:06,001
BPM100

ANIMATE multiLight2 {"play":false} 

2
00:00:06,000 --> 00:00:07,001
BPM100

2
00:00:11,863 --> 00:00:14,863
L0

2
00:00:50,863 --> 00:00:55,863 
L0
`
