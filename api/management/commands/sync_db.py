from django.core.management.base import BaseCommand
from django.apps import apps
from django.db.utils import OperationalError
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = "Sync data from db2 to the default database for all models"

    def handle(self, *args, **kwargs):
        app_models = apps.get_models()

        for model in app_models:
            model_name = model.__name__
            self.stdout.write(f"Syncing data for model: {model_name}")

            try:
                db2_records = model.objects.using('db2').all()
            except (OperationalError, TypeError) as e:
                self.stderr.write(self.style.ERROR(f"Error accessing db2 for model {model_name}: {e}"))
                continue

            try:
                for record in db2_records:
                    try:
                        self.stdout.write(f"Processing record with PK: {record.pk}")  # Debugging line
                        filter_criteria = {model._meta.pk.name: record.pk}
                        
                        if not model.objects.filter(**filter_criteria).exists():
                            record.pk = None  # Reset primary key to insert as new record
                            record.save(using='default')
                    except (Exception, ValueError, TypeError) as e:
                        self.stderr.write(self.style.WARNING(f"Skipping record {record.pk} for model {model_name} due to error: {e}"))
                        logger.warning(f"Error processing record {record.pk} in model {model_name}: {e}")
                        continue
            except (Exception, ValueError, TypeError) as e:
                self.stderr.write(self.style.ERROR(f"Error processing records for model {model_name}: {e}"))
                logger.error(f"Error processing records for model {model_name}: {e}")
                continue

        self.stdout.write(self.style.SUCCESS('Data syncing completed with errors skipped'))
