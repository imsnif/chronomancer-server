module.exports = {
  timelines: [
    {name: 'Timeline 1', type: 'steal', players: [1, 2, 3, 4], isLocked: false, gameId: 1},
    {name: 'Timeline 2', type: 'assist', players: [2, 3], isLocked: false, gameId: 1},
    {name: 'Timeline 3', type: 'prevent', players: [2, 3, 4], isLocked: false, gameId: 1},
    {name: 'Timeline 4', type: 'reset', isLocked: false, players: []},
    {name: 'Timeline 5', type: 'assist', players: [1, 2, 3, 5], isLocked: true, gameId: 1}
  ],
  players: [
    {
      id: 1,
      gameId: 1,
      name: 'No-Items Susan',
      items: [],
      actions: 10
    },
    {
      id: 2,
      gameId: 1,
      name: 'One-Item Siobahn',
      items: [
        {name: 'assist', source: 'Timeline 2'}
      ],
      actions: 10
    },
    {
      id: 3,
      gameId: 1,
      name: 'Gondollieri',
      items: [
        {name: 'assist', source: 'Timeline 2'},
        {name: 'prevent', source: 'Timeline 3'},
        {name: 'reset', source: 'Timeline 3'},
        {name: 'steal', source: 'Timeline 1'},
        {name: 'lock', source: 'Timeline 3'},
        {name: 'unlock', source: 'Timeline 1'}
      ],
      actions: 10
    },
    {
      id: 4,
      gameId: 1,
      name: 'Simmons',
      items: [
        {name: 'assist', source: 'Timeline 2'},
        {name: 'prevent', source: false},
        {name: 'reset', source: 'Timeline 3'},
        {name: 'steal', source: 'Timeline 1'},
        {name: 'lock', source: 'Timeline 2'},
        {name: 'unlock', source: 'Timeline 2'}
      ],
      actions: 10
    },
    {
      id: 5,
      gameId: 1,
      name: 'No-Actions Bob',
      items: [
        {name: 'assist', source: 'Timeline 2'},
        {name: 'lock', source: 'Timeline 2'},
        {name: 'unlock', source: 'Timeline 2'}
      ],
      actions: 0
    }
  ],
  powers: [
    {
      playerId: 1,
      gameId: 1,
      timelineName: 'Timeline 1',
      name: 'Resetting',
      startTime: Date.now(),
      endTime: Date.now() + 100000,
      target: {
        type: 'timeline',
        name: 'Timeline 1'
      },
      allies: [
        {id: 1, score: 8},
        {id: 2, score: 5}
      ],
      enemies: [
        {id: 3, score: 1},
        {id: 4, score: 9}
      ]
    },
    {
      playerId: 1,
      gameId: 1,
      timelineName: 'Timeline 2',
      name: 'Locking',
      startTime: Date.now(),
      endTime: Date.now() + 400000,
      target: {
        type: 'timeline',
        name: 'Timeline 2'
      },
      allies: [
        {id: 1, score: 8},
        {id: 2, score: 5}
      ],
      enemies: [
        {id: 3, score: 1},
        {id: 4, score: 9}
      ]
    },
    {
      playerId: 2,
      gameId: 1,
      timelineName: 'Timeline 1',
      name: 'Resetting',
      startTime: Date.now(),
      endTime: Date.now() + 1000000,
      target: {
        type: 'timeline',
        name: 'Timeline 1'
      },
      allies: [
        {id: 2, score: 1},
        {id: 1, score: 5}
      ],
      enemies: [
        {id: 3, score: 1},
        {id: 4, score: 2}
      ]
    },
    {
      playerId: 3,
      gameId: 1,
      timelineName: 'Timeline 1',
      name: 'Combining',
      startTime: Date.now(),
      endTime: Date.now() + 2000000,
      target: {
        type: 'timeline',
        name: 'Timeline 1'
      },
      allies: [
        {id: 3, score: 1},
        {id: 1, score: 2}
      ],
      enemies: [
        {id: 2, score: 2},
        {id: 4, score: 5}
      ]
    },
    {
      playerId: 4,
      gameId: 1,
      timelineName: 'Timeline 1',
      name: 'Locking',
      startTime: Date.now(),
      endTime: Date.now() + 100000,
      target: {
        type: 'timeline',
        name: 'Timeline 1'
      },
      allies: [
        {id: 4, score: 7},
        {id: 2, score: 2}
      ],
      enemies: [
        {id: 2, score: 2},
        {id: 1, score: 5}
      ]
    }
  ]
}
