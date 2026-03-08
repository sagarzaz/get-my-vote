from datetime import datetime, timezone
from database.db import get_settings_collection

class Settings:
    @staticmethod
    def get_setting(key):
        collection = get_settings_collection()
        setting = collection.find_one({'key': key})
        return setting
    
    @staticmethod
    def set_setting(key, value):
        collection = get_settings_collection()
        collection.update_one(
            {'key': key},
            {'$set': {'value': value, 'updatedAt': datetime.now(timezone.utc)}},
            upsert=True
        )
        return True
    
    @staticmethod
    def get_election_settings():
        collection = get_settings_collection()
        settings = collection.find_one({'key': 'election'})
        if settings:
            return settings.get('value', {})
        return {
            'votingOpen': False,
            'startTime': None,
            'endTime': None,
            'resultsPublished': False
        }
    
    @staticmethod
    def set_election_settings(voting_open, start_time=None, end_time=None, results_published=None):
        collection = get_settings_collection()
        # Get existing settings to preserve resultsPublished
        existing = Settings.get_election_settings()
        value = {
            'votingOpen': voting_open,
            'startTime': start_time,
            'endTime': end_time,
            'resultsPublished': results_published if results_published is not None else existing.get('resultsPublished', False),
            'updatedAt': datetime.now(timezone.utc).isoformat()
        }
        collection.update_one(
            {'key': 'election'},
            {'$set': {'value': value}},
            upsert=True
        )
        return value
    
    @staticmethod
    def is_voting_open():
        settings = Settings.get_election_settings()
        if not settings.get('votingOpen', False):
            return False, 'Voting is currently closed'
        
        now = datetime.now(timezone.utc)
        start_time = settings.get('startTime')
        end_time = settings.get('endTime')
        
        if start_time:
            start = datetime.fromisoformat(start_time.replace('Z', '+00:00'))
            if now < start:
                return False, f'Voting starts at {start_time}'
        
        if end_time:
            end = datetime.fromisoformat(end_time.replace('Z', '+00:00'))
            if now > end:
                return False, 'Voting has ended'
        
        return True, 'Voting is open'

settings_model = Settings()
