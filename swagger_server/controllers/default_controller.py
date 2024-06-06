import connexion
import six

from swagger_server.models.model import Model  # noqa: E501
from swagger_server.models.team import Team  # noqa: E501
from swagger_server import util


def update_model(body):  # noqa: E501
    """Create or update a model

     # noqa: E501

    :param body: 
    :type body: dict | bytes

    :rtype: None
    """
    if connexion.request.is_json:
        body = Model.from_dict(connexion.request.get_json())  # noqa: E501
    return 'do some magic!'


def update_team(body):  # noqa: E501
    """Create or update a team

     # noqa: E501

    :param body: 
    :type body: dict | bytes

    :rtype: None
    """
    if connexion.request.is_json:
        body = Team.from_dict(connexion.request.get_json())  # noqa: E501
    return 'do some magic!'
