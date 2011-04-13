doh.register("testMe", [
// test fixture that passes
{
	name : "fooTest",
	setUp : function() {
	},
	runTest : function(t) {
		t.assertTrue(1);
	},
	tearDown : function() {
	}
},
// test fixture that fails
{
	name : "barTest",
	setUp : function() {
		this.bar = "bar";
	},
	runTest : function(t) {
		t.assertEqual(this.bar, "b" + "a" + "rr");
	},
	tearDown : function() {
		delete this.bar;
	}
},

// standalone function that passes
function baz() {
	doh.assertFalse(0)
} ]);