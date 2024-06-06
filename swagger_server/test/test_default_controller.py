# coding: utf-8

from __future__ import absolute_import

from flask import json
from six import BytesIO

from swagger_server.models.model import Model  # noqa: E501
from swagger_server.models.team import Team  # noqa: E501
from swagger_server.test import BaseTestCase


class TestDefaultController(BaseTestCase):
    """DefaultController integration test stubs"""

    def test_update_model(self):
        """Test case for update_model

        Create or update a model
        """
        body = Model()
        response = self.client.open(
            '/model',
            method='PUT',
            data=json.dumps(body),
            content_type='application/xml')
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))

    def test_update_team(self):
        """Test case for update_team

        Create or update a team
        """
        body = Team()
        response = self.client.open(
            '/team',
            method='PUT',
            data=json.dumps(body),
            content_type='application/xml')
        self.assert200(response,
                       'Response body is : ' + response.data.decode('utf-8'))


if __name__ == '__main__':
    import unittest
    unittest.main()
