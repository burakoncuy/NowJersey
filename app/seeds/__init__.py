from flask.cli import AppGroup
from .users import seed_users, undo_users
from .items import seed_items, undo_items
# from .reviews import seed_reviews, undo_reviews
# from .favorites import seed_favorites, undo_favorites
# from .orders import seed_orders, undo_orders
# from .order_items import seed_order_items, undo_order_items
# from .carts import seed_carts, undo_carts
from app.models.db import db, environment, SCHEMA

# Creates a seed group to hold our commands
# So we can type `flask seed --help`
seed_commands = AppGroup('seed')


# Creates the `flask seed all` command
@seed_commands.command('all')
def seed():
    if environment == 'production':
        # Before seeding in production, you want to run the seed undo 
        # command, which will  truncate all tables prefixed with 
        # the schema name (see comment in users.py undo_users function).
        # Make sure to add all your other model's undo functions below
        
        # undo_reviews()
        # undo_order_items()
        # undo_orders() 
        # undo_carts()
        # undo_favorites()
        undo_items()
        undo_users()
    seed_users()
    seed_items()
    # seed_favorites()
    # seed_carts()
    # seed_orders()
    # seed_order_items()
    # seed_reviews()
   
    # Add other seed functions here


# Creates the `flask seed undo` command
@seed_commands.command('undo')
def undo():
    # undo_reviews()
    # undo_order_items()
    # undo_orders()
    # undo_carts()
    # undo_favorites()
    undo_items()
    undo_users()
    # Add other undo functions here
