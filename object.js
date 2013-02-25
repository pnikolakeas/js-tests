function Obj(config)
{
	Obj.copy(this, config);

	if (this.init) {
		this.init();
	}
}

Obj.copy = function(targetObject, sourceObject)
{
	if (!targetObject) {
		targetObject = {};
	}

	if (sourceObject) {
		for (var property in sourceObject) {
			targetObject[property] = sourceObject[property];
		}
	}

	return targetObject;
}

Obj.extend = function(superClass, subClassDefinition)
{
	// create prototype class
	var subClassPrototype = function() {};

	// delegates directly to superClass prototype
	subClassPrototype.prototype = superClass.prototype;

	// keep super class for convenience
	subClassPrototype.superClass = superClass;

	// create sub class
	var subClass = function() {
		// call the super constructor
		superClass.apply(this, arguments);
	};

	// our prototype is neat!
	subClass.prototype = new subClassPrototype();

	Obj.copy(subClass.prototype, subClassDefinition);

	return subClass;
}
