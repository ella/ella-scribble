redaction-front
===============

Playground for django-redaction

Development quick start
=======================

With virtualenv and virtualenvwrapper::

    $ mkvirtualenv --system-site-packages redaction
    $ git clone https://github.com/whit/django-redaction-front
    $ cd django-redaction-front
    $ pip install -r dev_requirements.txt
    $ cd redaction_front
    $ python manage.py syncdb
    $ python manage.py loaddata test_data
    $ python manage.py runserver

And open http://127.0.0.1:8000 in yaour browser. On index page you can see more info.

Also you can create file redaction_front/settings_local.py with your own settings.
