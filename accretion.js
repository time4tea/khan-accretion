
var Vector = function(x,y,z) {
    this.x = x;
    this.y = y;
    this.z = z;
};

Vector.prototype.add = function(v) {
    return new Vector(
        this.x + v.x,
        this.y + v.y,
        this.z + v.z
    );
};

Vector.prototype.scale = function(s) {
    return new Vector(
        this.x * s,
        this.y * s,
        this.z * s
    );
};

Vector.prototype.magnitude = function() {
    return  sqrt( ( pow ( this.x , 2 ) ) + ( pow ( this.y , 2 ) ) + ( pow ( this.z, 2 ) ) );
};

var Location = function(x,y,z) {
    this.x = x;
    this.y = y;
    this.z = z;
};

Location.prototype.translate = function(v) {
    return new Location(this.x + v.x,
        this.y + v.y,
        this.z + v.z);
};

Location.prototype.distance_to = function(l) {
    return new Vector(
        this.x - l.x,
        this.y - l.y,
        this.z - l.z
    );
};

var Particle = function(m, l, v) {
    this.mass = m;
    this.position = l;
    this.velocity = v;
};

Particle.prototype.step = function() {
    this.position = this.position.translate(this.velocity);
};

Particle.prototype.accelerate = function(v) {
    this.velocity = this.velocity.add(v);
};

Particle.prototype.combine_with = function(p) {
    if ( this === p ) {
        return;
    }

    this.mass += p.mass;
    this.velocity = this.velocity.scale(this.mass).add(p.velocity.scale(p.mass)).scale(
        1 / ( this.mass + p.mass )
    ) ;
};

var Universe = function() {
    this.gravity =  0.03;
    this.particles = [];
};

Universe.prototype.add = function(p) {
    this.particles.push(p);
};

Universe.prototype.traverse = function(c) {
    var particles = this.particles;
    for ( var i = 0 ; i < particles.length ; i++ ) {
        if ( particles[i] ) {
            var remove = c(particles[i]);
            if ( remove ) {
                particles[i] = undefined;
            }
        }
    }
};

Universe.prototype.attraction_between = function(px, py) {

    if ( px === py ) {
        return new Vector(0,0,0);
    }

    var distance = px.position.distance_to(py.position);

    var magnitude = distance.magnitude();

    var force = ( this.gravity * px.mass * py.mass ) / pow ( magnitude , 2 );

    return distance.scale(-force);
};

var UniverseRenderer = function(u) {
    this.universe = u;
    this.origin = new Vector( 200, 200,0 );
    this.zoom = 0.5;
};

UniverseRenderer.prototype.render = function() {
    var r = this;
    this.universe.traverse(function(p) {
        var position = p.position;
        ellipse(
            ( position.x * r.zoom ) + r.origin.x,
            (position.y * r.zoom ) + r.origin.y,
            p.mass , p.mass
        );
    });
};

var Forge = function() {

};

Forge.prototype.create = function() {
    return new Particle(
        random(0,5) ,
        new Location(
            random(0,400),
            random(0,400) ,
            0
        ),
        new Vector( 0, 0 ,0)
    );
};

var AccretionModel = function(u) {
    this.universe = u;
    this.combination_distance = 2;
};

AccretionModel.prototype.step = function() {
    var model = this;
    var universe = this.universe;

    universe.traverse(function(px) {
        universe.traverse(function(py) {
            if ( px === py ) {
                return;
            }
            var distance = px.position.distance_to(py.position).magnitude();
            if ( distance < model.combination_distance ) {
                debug( px.position );
                debug ( py.position );
                debug(distance);

                px.combine_with(py);
                return true;
            }
            else {
                px.accelerate(universe.attraction_between(px, py));
            }
        });
    });

    this.universe.traverse(function(p) {
        p.step();
    });
};

var forge = new Forge();
var universe = new Universe();
var model = new AccretionModel(universe);
var renderer = new UniverseRenderer(universe);

var init = function() {
    frameRate(25);
    for ( var i = 0 ; i <10 ; i++ ) {
        universe.add(forge.create());
    }
};

var draw = function() {
    background(255,255,255);
    model.step();
    renderer.render();
};

init();
