// Copyright 2014-2015, University of Colorado Boulder

/**
 * Model representation of a particle.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Property = require( 'AXON/Property' );
  var ShredConstants = require( 'SHRED/ShredConstants' );
  var shred = require( 'SHRED/shred' );
  var Tandem = require( 'TANDEM/Tandem' );
  var Vector2 = require( 'DOT/Vector2' );

  // phet-io modules
  var TBoolean = require( 'ifphetio!PHET_IO/types/TBoolean' );
  var TNumber = require( 'ifphetio!PHET_IO/types/TNumber' );
  var TParticle = require( 'ifphetio!PHET_IO/types/shred/TParticle' );
  var TString = require( 'ifphetio!PHET_IO/types/TString' );
  var TVector2 = require( 'ifphetio!PHET_IO/types/dot/TVector2' );

  // constants
  var DEFAULT_PARTICLE_VELOCITY = 200; // Basically in pixels/sec.

  /**
   * @param {string} type
   * @param {Object} options
   * @constructor
   */
  function Particle( type, options ) {

    options = _.extend( {
      tandem: Tandem.tandemRequired()
    }, options );
    this.particleTandem = options.tandem;

    this.type = type; // @public (read-only)

    // @public
    this.positionProperty = new Property( Vector2.ZERO, {
      tandem: options.tandem && options.tandem.createTandem( 'positionProperty' ),
      phetioValueType: TVector2
    } );
    this.destinationProperty = new Property( Vector2.ZERO, {
      tandem: options.tandem && options.tandem.createTandem( 'destinationProperty' ),
      phetioValueType: TVector2
    } );
    this.radiusProperty = new Property(
      type === 'electron' ? ShredConstants.ELECTRON_RADIUS : ShredConstants.NUCLEON_RADIUS,
      {
        tandem: options.tandem && options.tandem.createTandem( 'radiusProperty' ),
        phetioValueType: TNumber( { type: 'FloatingPoint' } )
      }
    );
    this.velocityProperty = new Property( DEFAULT_PARTICLE_VELOCITY, {
      tandem: options.tandem && options.tandem.createTandem( 'velocityProperty' ),
      phetioValueType: TNumber( { type: 'FloatingPoint' } )
    } );
    this.userControlledProperty = new Property( false, {
      tandem: options.tandem && options.tandem.createTandem( 'userControlledProperty' ),
      phetioValueType: TBoolean
    } );
    this.zLayerProperty = new Property( 0, {
      tandem: options.tandem && options.tandem.createTandem( 'zLayerProperty' ),
      phetioValueType: TNumber( { type: 'Integer' } )
    } ); // Used in view, integer value, higher means further back.

    options.tandem.addInstance( this, TParticle );
  }

  shred.register( 'Particle', Particle );

  return inherit( Object, Particle, {
    /**
     * @param {number} dt
     * @public
     */
    step: function( dt ) {
      if ( !this.userControlledProperty.get() ) {
        var position = this.positionProperty.get();
        var destination = this.destinationProperty.get();
        var velocity = this.velocityProperty.get();
        var distanceToDestination = position.distance( destination );
        if ( distanceToDestination > dt * velocity ) {
          // This was broken up into individual steps in an attempt to solve an issue where complex vector operations
          // sometimes didn't work.
          var stepMagnitude = velocity * dt;
          var stepAngle = Math.atan2( destination.y - position.y, destination.x - position.x );
          var stepVector = Vector2.createPolar( stepMagnitude, stepAngle );

          // Move a step toward the destination.
          this.positionProperty.set( position.plus( stepVector ) );
        }
        else if ( distanceToDestination > 0 ) {
          // Less than one time step away, so just go to the destination.
          this.moveImmediatelyToDestination();
        }
      }
    },

    // @public
    moveImmediatelyToDestination: function() {
      this.positionProperty.set( this.destinationProperty.get() );
    },

    /**
     * @param {Vector2} newPosition
     * @public
     */
    setPositionAndDestination: function( newPosition ) {
      assert && assert( newPosition instanceof Vector2, 'Attempt to set non-vector position.' );
      if ( newPosition instanceof Vector2 ) {
        this.destinationProperty.set( newPosition );
        this.moveImmediatelyToDestination();
      }
    }
  } );
} );
