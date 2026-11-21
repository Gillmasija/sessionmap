export function demoSession() {
  return {version:1, title:'Design a better study space', start:'10:00', target:90, activities:[
    {id:'demo-1',title:'Welcome & one small frustration',type:'Discuss',minutes:10,notes:'Invite each person to share one thing that makes studying difficult. Capture themes without solving them yet.'},
    {id:'demo-2',title:'Map the current experience',type:'Practice',minutes:20,notes:'In pairs, sketch a typical study session. Mark the moments where focus slips.'},
    {id:'demo-3',title:'Share what you noticed',type:'Present',minutes:15,notes:'Each pair shares one insight. Look for patterns across the room.'},
    {id:'demo-4',title:'Take a breather',type:'Break',minutes:10,notes:'Stand, stretch, and refill water.'},
    {id:'demo-5',title:'Prototype one small change',type:'Practice',minutes:20,notes:'Choose one challenge. Sketch a change you could try this week.'},
    {id:'demo-6',title:'Commit to the next step',type:'Discuss',minutes:10,notes:'Share the experiment you will try and how you will know it helped.'}
  ]};
}
