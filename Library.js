//==============================================================================
// Library class for reading/writing to firebase
//
//============================================================================== 


//============================================================================== 
var DataStore = function(root)
{
    this._watcher = "undefined";
	
	var config = {
		apiKey: "AIzaSyA-CBk6tpB3apaf1p3kxfhIBsNJ4wVYKTM",
		authDomain: "phelpstown.firebaseapp.com",
		databaseURL: "https://phelpstown.firebaseio.com",
		storageBucket: "firebase-phelpstown.appspot.com",
	};
	firebase.initializeApp(config);
    this._firebase_ref = firebase.database().ref();
}

//============================================================================== 
DataStore.prototype.GetRef = function( root )
{
    return firebase.database().ref( root );
}

//============================================================================== 
DataStore.prototype.ReadAsArray = function( root, context, callback )
{
    var ref = this.GetRef( root );
    var array = context( ref );

    array.$loaded( function( data )
    {
        callback( data );
    });
}

//==============================================================================
DataStore.prototype.ReadValue = function( root, context, callback )
{
    var ref = this.GetRef( root );
    var obj = context( ref );

   obj.$loaded().then(function() {
       callback(obj.$value);
   });
}
//==============================================================================
DataStore.prototype.Write = function( entry, root )
{
    var ref = this.GetRef( root );
    ref.update( entry );
}

//==============================================================================
DataStore.prototype.RegisterWatcher = function( root, context, callback )
{
    var ref = this.GetRef( root );
    var obj = context( ref );

    this._watcher = obj.$watch(function() {
		console.log("Watched: " + obj);
        callback( obj.$value );
    });
}

//==============================================================================
DataStore.prototype.RegisterChildWatcher = function( root, context, callback )
{
    var ref = this.GetRef( root );
    var obj = context( ref );

    this._watcher = obj.$watch(function() {
        callback( obj );
    });
}

//==============================================================================
DataStore.prototype.RegisterTimer = function( game, offset, running, end_time )
{
    var timer_ref = this.GetRef( game + "/Timer" );
    var running_ref = this.GetRef( game + "/Night" );
    var offset_ref = this.GetRef( ".info/serverTimeOffset" );

    timer_ref.on( "value", end_time );
    running_ref.on( "value", running );
    offset_ref.on( "value", offset );
}

//==============================================================================
DataStore.prototype.StartTimer = function( game )
{
    var timer_ref = this.GetRef( game + "/Timer" );
    var running_ref = this.GetRef( game + "/Night" );

    running_ref.set( true );
    timer_ref.set(Now() + 120 * 1000);
}

//==============================================================================
DataStore.prototype.StopTimer = function( game )
{
    var timer_ref = this.GetRef( game + "/Timer" );
    var running_ref = this.GetRef( game + "/Night" );

    running_ref.set( false );
    timer_ref.set(0);
}

// UTIL TIMER FUNCTIONS
function Now()
{
    return Date.now() + m_offset;
}
